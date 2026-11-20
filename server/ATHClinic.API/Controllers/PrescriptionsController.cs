
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ATHClinic.API.Controllers
{
    [Authorize(Roles = "Admin,Doctor")]
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly ATHClinicContext _context;

        public PrescriptionsController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/prescriptions
        [HttpGet]
        public async Task<IActionResult> GetPrescriptions()
        {
            var query = _context.Prescriptions.AsNoTracking();

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(p =>
                    p.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var prescriptions = await query
                .Select(p => new
                {
                    p.PrescriptionId,
                    p.VisitId,
                    p.PrescriptionDate,
                    p.Instructions,

                    PatientName = p.Visit.Appointment.Patient.FullName,
                    DoctorName = p.Visit.Appointment.Doctor.FullName,

                    Items = p.PrescriptionItems.Select(i => new
                    {
                        i.PrescriptionItemId,
                        i.MedicineId,
                        MedicineName = i.Medicine.MedicineName,
                        i.Dosage,
                        i.Frequency,
                        i.Duration,
                        i.Quantity,
                        i.Instructions
                    })
                })
                .ToListAsync();

            return Ok(prescriptions);
        }

        // GET: api/prescriptions/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPrescription(int id)
        {
            var query = _context.Prescriptions
                .AsNoTracking()
                .Where(p => p.PrescriptionId == id);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(p =>
                    p.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var prescription = await query
                .Select(p => new
                {
                    p.PrescriptionId,
                    p.VisitId,
                    p.PrescriptionDate,
                    p.Instructions,

                    PatientName = p.Visit.Appointment.Patient.FullName,
                    DoctorName = p.Visit.Appointment.Doctor.FullName,

                    Items = p.PrescriptionItems.Select(i => new
                    {
                        i.PrescriptionItemId,
                        i.MedicineId,
                        MedicineName = i.Medicine.MedicineName,
                        i.Dosage,
                        i.Frequency,
                        i.Duration,
                        i.Quantity,
                        i.Instructions
                    })
                })
                .FirstOrDefaultAsync();

            if (prescription == null)
                return NotFound(new
                {
                    message = "Prescription not found."
                });

            return Ok(prescription);
        }

        // POST: api/prescriptions
        [HttpPost]
        public async Task<IActionResult> CreatePrescription(
            [FromBody] CreatePrescriptionRequest request)
        {
            var visit = await _context.Visits
                .Include(v => v.Appointment)
                .FirstOrDefaultAsync(v => v.VisitId == request.VisitId);

            if (visit == null)
                return NotFound(new { message = "Visit not found." });

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                if (visit.Appointment.DoctorId != doctorId.Value)
                    return Forbid();
            }

            var alreadyExists = await _context.Prescriptions
                .AnyAsync(p => p.VisitId == request.VisitId);

            if (alreadyExists)
                return Conflict(new
                {
                    message = "A prescription already exists for this visit."
                });

            var prescription = new Prescription
            {
                VisitId = request.VisitId,
                PrescriptionDate = DateTime.Now,
                Instructions = request.Instructions
            };

            _context.Prescriptions.Add(prescription);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPrescription),
                new { id = prescription.PrescriptionId },
                new
                {
                    message = "Prescription created successfully.",
                    prescriptionId = prescription.PrescriptionId,
                    prescription.VisitId,
                    prescription.PrescriptionDate,
                    prescription.Instructions
                });
        }

        // PUT: api/prescriptions/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdatePrescription(
            int id,
            [FromBody] UpdatePrescriptionRequest request)
        {
            var query = _context.Prescriptions
                .Include(p => p.Visit)
                    .ThenInclude(v => v.Appointment)
                .Where(p => p.PrescriptionId == id);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(p =>
                    p.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var prescription = await query.FirstOrDefaultAsync();

            if (prescription == null)
                return NotFound(new
                {
                    message = "Prescription not found."
                });

            prescription.Instructions = request.Instructions;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Prescription updated successfully.",
                prescription.PrescriptionId,
                prescription.VisitId,
                prescription.PrescriptionDate,
                prescription.Instructions
            });
        }

        // DELETE: api/prescriptions/1
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePrescription(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .FirstOrDefaultAsync(p => p.PrescriptionId == id);

            if (prescription == null)
                return NotFound(new
                {
                    message = "Prescription not found."
                });

            _context.PrescriptionItems.RemoveRange(
                prescription.PrescriptionItems);

            _context.Prescriptions.Remove(prescription);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Prescription deleted successfully."
            });
        }

        // Get logged-in doctor's database ID
        private async Task<int?> GetCurrentDoctorIdAsync()
        {
            var userIdClaim =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out int userId))
                return null;

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId);

            return doctor?.DoctorId;
        }
    }

    public class CreatePrescriptionRequest
    {
        public int VisitId { get; set; }
        public string? Instructions { get; set; }
    }

    public class UpdatePrescriptionRequest
    {
        public string? Instructions { get; set; }
    }
}
