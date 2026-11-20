
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ATHClinic.API.Data;
using ATHClinic.API.Models;

namespace ATHClinic.API.Controllers;

[Authorize(Roles = "Admin,Doctor,Receptionist")]
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly ATHClinicContext _context;

    public PatientsController(ATHClinicContext context)
    {
        _context = context;
    }

    // GET: api/patients
    [HttpGet]
    public async Task<IActionResult> GetPatients()
    {
        var query = _context.Patients
            .AsNoTracking()
            .AsQueryable();

        // Doctors can only see their assigned patients
        if (User.IsInRole("Doctor"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(p =>
                p.Appointments.Any(a => a.DoctorId == doctorId.Value));
        }

        var patients = await query.ToListAsync();

        return Ok(patients);
    }

    // GET: api/patients/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPatient(int id)
    {
        var query = _context.Patients
            .AsNoTracking()
            .Where(p => p.PatientId == id);

        // Restrict doctors to their assigned patients
        if (User.IsInRole("Doctor"))
        {
            var doctorId = await GetCurrentDoctorIdAsync();

            if (doctorId == null)
                return Forbid();

            query = query.Where(p =>
                p.Appointments.Any(a => a.DoctorId == doctorId.Value));
        }

        var patient = await query.FirstOrDefaultAsync();

        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        return Ok(patient);
    }

    // POST: api/patients
    [Authorize(Roles = "Admin,Receptionist")]
    [HttpPost]
    public async Task<IActionResult> CreatePatient(Patient patient)
    {
        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetPatient),
            new { id = patient.PatientId },
            patient
        );
    }

    // PUT: api/patients/1
    [Authorize(Roles = "Admin,Receptionist")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePatient(
        int id, Patient updatedPatient)
    {
        var patient = await _context.Patients.FindAsync(id);

        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        patient.FullName = updatedPatient.FullName;
        patient.Gender = updatedPatient.Gender;
        patient.DateOfBirth = updatedPatient.DateOfBirth;
        patient.Phone = updatedPatient.Phone;
        patient.Email = updatedPatient.Email;
        patient.Address = updatedPatient.Address;
        patient.BloodGroup = updatedPatient.BloodGroup;

        await _context.SaveChangesAsync();

        return Ok(patient);
    }

    // DELETE: api/patients/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients.FindAsync(id);

        if (patient == null)
            return NotFound(new { message = "Patient not found." });

        _context.Patients.Remove(patient);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Patient deleted successfully." });
    }

    // Get the Doctor ID of the logged-in user
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
