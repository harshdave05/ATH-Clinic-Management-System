
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ATHClinic.API.Models;
using ATHClinic.API.Data;

namespace ATHClinic.API.Controllers
{
    [Authorize(Roles = "Admin,Doctor")]
    [ApiController]
    [Route("api/[controller]")]
    public class VisitsController : ControllerBase
    {
        private readonly ATHClinicContext _context;

        public VisitsController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/visits
        [HttpGet]
        public async Task<IActionResult> GetVisits()
        {
            var query = _context.Visits.AsQueryable();

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(v =>
                    v.Appointment.DoctorId == doctorId.Value);
            }

            var visits = await query
                .Select(v => new
                {
                    v.VisitId,
                    v.AppointmentId,
                    PatientName = v.Appointment.Patient.FullName,
                    DoctorName = v.Appointment.Doctor.FullName,
                    v.Symptoms,
                    v.Diagnosis,
                    v.Notes,
                    v.VisitDate
                })
                .ToListAsync();

            return Ok(visits);
        }

        // GET: api/visits/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetVisit(int id)
        {
            var query = _context.Visits
                .Where(v => v.VisitId == id);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(v =>
                    v.Appointment.DoctorId == doctorId.Value);
            }

            var visit = await query
                .Select(v => new
                {
                    v.VisitId,
                    v.AppointmentId,
                    PatientName = v.Appointment.Patient.FullName,
                    DoctorName = v.Appointment.Doctor.FullName,
                    v.Symptoms,
                    v.Diagnosis,
                    v.Notes,
                    v.VisitDate
                })
                .FirstOrDefaultAsync();

            if (visit == null)
                return NotFound(new { message = "Visit not found." });

            return Ok(visit);
        }

        // POST: api/visits
        [HttpPost]
        public async Task<IActionResult> CreateVisit(
            CreateVisitRequest request)
        {
            var appointment = await _context.Appointments
                .FindAsync(request.AppointmentId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            // A Doctor can create visits only for their appointments
            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                if (appointment.DoctorId != doctorId.Value)
                    return Forbid();
            }

            var existingVisit = await _context.Visits
                .AnyAsync(v => v.AppointmentId == request.AppointmentId);

            if (existingVisit)
                return Conflict(new
                {
                    message = "A visit already exists for this appointment."
                });

            var visit = new Visit
            {
                AppointmentId = request.AppointmentId,
                Symptoms = request.Symptoms,
                Diagnosis = request.Diagnosis,
                Notes = request.Notes,
                VisitDate = DateTime.Now
            };

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetVisit),
                new { id = visit.VisitId },
                visit
            );
        }

        // PUT: api/visits/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateVisit(
            int id, UpdateVisitRequest request)
        {
            Visit? visit;

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                visit = await _context.Visits
                    .FirstOrDefaultAsync(v =>
                        v.VisitId == id &&
                        v.Appointment.DoctorId == doctorId.Value);
            }
            else
            {
                visit = await _context.Visits
                    .FindAsync(id);
            }

            if (visit == null)
                return NotFound(new { message = "Visit not found." });

            visit.Symptoms = request.Symptoms;
            visit.Diagnosis = request.Diagnosis;
            visit.Notes = request.Notes;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Visit updated successfully.",
                visit
            });
        }

        // DELETE: api/visits/1
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteVisit(int id)
        {
            var visit = await _context.Visits.FindAsync(id);

            if (visit == null)
                return NotFound(new { message = "Visit not found." });

            _context.Visits.Remove(visit);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Visit deleted successfully."
            });
        }

        // Get the logged-in Doctor ID
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

    // DTO for creating a visit
    public class CreateVisitRequest
    {
        public int AppointmentId { get; set; }
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }

    // DTO for updating a visit
    public class UpdateVisitRequest
    {
        public string? Symptoms { get; set; }
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
    }
}
