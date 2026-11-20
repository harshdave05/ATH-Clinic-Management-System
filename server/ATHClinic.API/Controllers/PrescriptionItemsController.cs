
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
    public class PrescriptionItemsController : ControllerBase
    {
        private readonly ATHClinicContext _context;

        public PrescriptionItemsController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/prescriptionitems
        [HttpGet]
        public async Task<IActionResult> GetPrescriptionItems()
        {
            var query = _context.PrescriptionItems.AsNoTracking();

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(i =>
                    i.Prescription.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var items = await query
                .Select(i => new
                {
                    i.PrescriptionItemId,
                    i.PrescriptionId,
                    i.MedicineId,
                    MedicineName = i.Medicine.MedicineName,
                    i.Dosage,
                    i.Frequency,
                    i.Duration,
                    i.Quantity,
                    i.Instructions
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/prescriptionitems/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPrescriptionItem(int id)
        {
            var query = _context.PrescriptionItems
                .AsNoTracking()
                .Where(i => i.PrescriptionItemId == id);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(i =>
                    i.Prescription.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var item = await query
                .Select(i => new
                {
                    i.PrescriptionItemId,
                    i.PrescriptionId,
                    i.MedicineId,
                    MedicineName = i.Medicine.MedicineName,
                    i.Dosage,
                    i.Frequency,
                    i.Duration,
                    i.Quantity,
                    i.Instructions
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound(new
                {
                    message = "Prescription item not found."
                });

            return Ok(item);
        }

        // GET: api/prescriptionitems/prescription/1
        [HttpGet("prescription/{prescriptionId:int}")]
        public async Task<IActionResult> GetItemsByPrescription(int prescriptionId)
        {
            var prescriptionQuery = _context.Prescriptions
                .Where(p => p.PrescriptionId == prescriptionId);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                prescriptionQuery = prescriptionQuery.Where(p =>
                    p.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var prescriptionExists = await prescriptionQuery.AnyAsync();

            if (!prescriptionExists)
                return NotFound(new
                {
                    message = "Prescription not found."
                });

            var items = await _context.PrescriptionItems
                .AsNoTracking()
                .Where(i => i.PrescriptionId == prescriptionId)
                .Select(i => new
                {
                    i.PrescriptionItemId,
                    i.PrescriptionId,
                    i.MedicineId,
                    MedicineName = i.Medicine.MedicineName,
                    i.Dosage,
                    i.Frequency,
                    i.Duration,
                    i.Quantity,
                    i.Instructions
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/prescriptionitems
        [HttpPost]
        public async Task<IActionResult> CreatePrescriptionItem(
            [FromBody] CreatePrescriptionItemRequest request)
        {
            if (request.Quantity <= 0)
                return BadRequest(new
                {
                    message = "Quantity must be greater than zero."
                });

            var prescription = await _context.Prescriptions
                .Include(p => p.Visit)
                    .ThenInclude(v => v.Appointment)
                .FirstOrDefaultAsync(p =>
                    p.PrescriptionId == request.PrescriptionId);

            if (prescription == null)
                return NotFound(new
                {
                    message = "Prescription not found."
                });

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                if (prescription.Visit.Appointment.DoctorId != doctorId.Value)
                    return Forbid();
            }

            var medicineExists = await _context.Medicines
                .AnyAsync(m => m.MedicineId == request.MedicineId);

            if (!medicineExists)
                return NotFound(new
                {
                    message = "Medicine not found."
                });

            var item = new PrescriptionItem
            {
                PrescriptionId = request.PrescriptionId,
                MedicineId = request.MedicineId,
                Dosage = request.Dosage,
                Frequency = request.Frequency,
                Duration = request.Duration,
                Quantity = request.Quantity,
                Instructions = request.Instructions
            };

            _context.PrescriptionItems.Add(item);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPrescriptionItem),
                new { id = item.PrescriptionItemId },
                new
                {
                    message = "Prescription item added successfully.",
                    item.PrescriptionItemId,
                    item.PrescriptionId,
                    item.MedicineId,
                    item.Dosage,
                    item.Frequency,
                    item.Duration,
                    item.Quantity,
                    item.Instructions
                });
        }

        // PUT: api/prescriptionitems/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdatePrescriptionItem(
            int id,
            [FromBody] UpdatePrescriptionItemRequest request)
        {
            if (request.Quantity <= 0)
                return BadRequest(new
                {
                    message = "Quantity must be greater than zero."
                });

            var query = _context.PrescriptionItems
                .Include(i => i.Prescription)
                    .ThenInclude(p => p.Visit)
                        .ThenInclude(v => v.Appointment)
                .Where(i => i.PrescriptionItemId == id);

            if (User.IsInRole("Doctor"))
            {
                var doctorId = await GetCurrentDoctorIdAsync();

                if (doctorId == null)
                    return Forbid();

                query = query.Where(i =>
                    i.Prescription.Visit.Appointment.DoctorId == doctorId.Value);
            }

            var item = await query.FirstOrDefaultAsync();

            if (item == null)
                return NotFound(new
                {
                    message = "Prescription item not found."
                });

            var medicineExists = await _context.Medicines
                .AnyAsync(m => m.MedicineId == request.MedicineId);

            if (!medicineExists)
                return NotFound(new
                {
                    message = "Medicine not found."
                });

            item.MedicineId = request.MedicineId;
            item.Dosage = request.Dosage;
            item.Frequency = request.Frequency;
            item.Duration = request.Duration;
            item.Quantity = request.Quantity;
            item.Instructions = request.Instructions;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Prescription item updated successfully.",
                item.PrescriptionItemId,
                item.PrescriptionId,
                item.MedicineId,
                item.Dosage,
                item.Frequency,
                item.Duration,
                item.Quantity,
                item.Instructions
            });
        }

        // DELETE: api/prescriptionitems/1
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePrescriptionItem(int id)
        {
            var item = await _context.PrescriptionItems
                .FindAsync(id);

            if (item == null)
                return NotFound(new
                {
                    message = "Prescription item not found."
                });

            _context.PrescriptionItems.Remove(item);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Prescription item deleted successfully."
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

    public class CreatePrescriptionItemRequest
    {
        public int PrescriptionId { get; set; }
        public int MedicineId { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
    }

    public class UpdatePrescriptionItemRequest
    {
        public int MedicineId { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Instructions { get; set; }
    }
}
