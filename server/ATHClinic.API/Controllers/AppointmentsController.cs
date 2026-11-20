using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace ATHClinic.API.Controllers;

[Authorize(Roles = "Admin,Doctor,Receptionist")]
[ApiController]
[Route("api/[controller]")]

public class AppointmentsController : ControllerBase
{
    private readonly ATHClinicContext _context;

    public AppointmentsController(ATHClinicContext context)
    {
        _context = context;
    }

    // GET: api/appointments
    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var query = _context.Appointments.AsQueryable();

        if (User.IsInRole("Doctor"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.FullName,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Reason = a.Reason,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
                    .ToListAsync();

        return Ok(appointments);
    }

    // GET: api/appointments/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAppointmentById(int id)
    {
        var query = _context.Appointments
            .Where(a => a.AppointmentId == id);

        if (User.IsInRole("Doctor"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        var appointment = await query
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.FullName,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Reason = a.Reason,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (appointment == null)
            return NotFound(new { message = "Appointment not found." });

        return Ok(appointment);
    }

    // GET: api/appointments/patient/1
    [HttpGet("patient/{patientId:int}")]
    public async Task<IActionResult> GetAppointmentsByPatient(int patientId)
    {
        var patientExists = await _context.Patients
            .AnyAsync(p => p.PatientId == patientId);

        if (!patientExists)
            return NotFound(new { message = "Patient not found." });

        var appointments = await _context.Appointments
            .Where(a => a.PatientId == patientId)
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.FullName,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Reason = a.Reason,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
                    .ToListAsync();

        return Ok(appointments);
    }

    // GET: api/appointments/doctor/1
    [HttpGet("doctor/{doctorId:int}")]
    public async Task<IActionResult> GetAppointmentsByDoctor(int doctorId)
    {
        var doctorExists = await _context.Doctors
            .AnyAsync(d => d.DoctorId == doctorId);

        if (!doctorExists)
            return NotFound(new { message = "Doctor not found." });

        if (User.IsInRole("Doctor"))
        {
            var currentDoctorId = await GetCurrentDoctorIdAsync();

            if (currentDoctorId == null || currentDoctorId.Value != doctorId)
                return Forbid();
        }

        var appointments = await _context.Appointments
            .Where(a => a.DoctorId == doctorId)
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new AppointmentResponse
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.FullName,
                AppointmentDate = a.AppointmentDate,
                AppointmentTime = a.AppointmentTime,
                Reason = a.Reason,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
                    .ToListAsync();

        return Ok(appointments);
    }

    // POST: api/appointments
    [Authorize(Roles = "Admin,Receptionist")]
    [HttpPost]
    public async Task<IActionResult> CreateAppointment(
        AppointmentRequest request)
    {
        var patient = await _context.Patients
            .FindAsync(request.PatientId);

        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        var doctor = await _context.Doctors
            .FindAsync(request.DoctorId);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        if (!doctor.IsAvailable)
            return BadRequest(new { message = "Doctor is not available." });

        if (request.AppointmentDate < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(new { message = "Appointment date cannot be in the past." });

        if (!IsValidStatus(request.Status))
            return BadRequest(new { message = "Invalid appointment status." });

        var slotTaken = await _context.Appointments.AnyAsync(a =>
            a.DoctorId == request.DoctorId &&
            a.AppointmentDate == request.AppointmentDate &&
            a.AppointmentTime == request.AppointmentTime &&
            a.Status != "Cancelled");

        if (slotTaken)
            return Conflict(new { message = "Doctor already has an appointment at this time." });

        var appointment = new Appointment
        {
            PatientId = request.PatientId,
            DoctorId = request.DoctorId,
            AppointmentDate = request.AppointmentDate,
            AppointmentTime = request.AppointmentTime,
            Reason = request.Reason,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var response = new AppointmentResponse
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            AppointmentDate = appointment.AppointmentDate,
            AppointmentTime = appointment.AppointmentTime,
            Reason = appointment.Reason,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };

        return CreatedAtAction(
            nameof(GetAppointmentById),
            new { id = appointment.AppointmentId },
            response);
    }

    // PUT: api/appointments/1
    [Authorize(Roles = "Admin,Receptionist")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateAppointment(
        int id, AppointmentRequest request)
    {
        var appointment = await _context.Appointments
            .FindAsync(id);

        if (appointment == null)
            return NotFound(new { message = "Appointment not found." });

        var patient = await _context.Patients
            .FindAsync(request.PatientId);

        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        var doctor = await _context.Doctors
            .FindAsync(request.DoctorId);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        if (!doctor.IsAvailable)
            return BadRequest(new { message = "Doctor is not available." });

        if (request.AppointmentDate < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest(new { message = "Appointment date cannot be in the past." });

        if (!IsValidStatus(request.Status))
            return BadRequest(new { message = "Invalid appointment status." });

        var slotTaken = await _context.Appointments.AnyAsync(a =>
            a.AppointmentId != id &&
            a.DoctorId == request.DoctorId &&
            a.AppointmentDate == request.AppointmentDate &&
            a.AppointmentTime == request.AppointmentTime &&
            a.Status != "Cancelled");

        if (slotTaken)
            return Conflict(new { message = "Doctor already has an appointment at this time." });

        appointment.PatientId = request.PatientId;
        appointment.DoctorId = request.DoctorId;
        appointment.AppointmentDate = request.AppointmentDate;
        appointment.AppointmentTime = request.AppointmentTime;
        appointment.Reason = request.Reason;
        appointment.Status = request.Status;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Appointment updated successfully." });
    }

    // DELETE: api/appointments/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        var appointment = await _context.Appointments
            .FindAsync(id);

        if (appointment == null)
            return NotFound(new { message = "Appointment not found." });

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Appointment deleted successfully." });
    }

    private static bool IsValidStatus(string status)
    {
        return new[] { "Scheduled", "Completed", "Cancelled" }
            .Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    private async Task<int?> GetCurrentDoctorIdAsync()
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(userIdClaim, out int userId))
            return null;

        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == userId);

        return doctor?.DoctorId;
    }
}

// Request DTO
public class AppointmentRequest
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "Scheduled";
}

// Response DTO
public class AppointmentResponse
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = "";
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = "";
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
