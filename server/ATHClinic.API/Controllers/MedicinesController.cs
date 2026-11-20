
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ATHClinic.API.Controllers
{
    [Authorize(Roles = "Admin,Doctor")]
    [ApiController]
    [Route("api/[controller]")]
    public class MedicinesController : ControllerBase
    {
        private readonly ATHClinicContext _context;

        public MedicinesController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/medicines
        [HttpGet]
        public async Task<IActionResult> GetMedicines()
        {
            var medicines = await _context.Medicines
                .AsNoTracking()
                .ToListAsync();

            return Ok(medicines);
        }

        // GET: api/medicines/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMedicine(int id)
        {
            var medicine = await _context.Medicines
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MedicineId == id);

            if (medicine == null)
                return NotFound(new
                {
                    message = "Medicine not found."
                });

            return Ok(medicine);
        }

        // POST: api/medicines
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateMedicine(
            [FromBody] MedicineRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MedicineName))
                return BadRequest(new
                {
                    message = "Medicine name is required."
                });

            if (request.UnitPrice < 0 || request.StockQuantity < 0)
                return BadRequest(new
                {
                    message = "Price and stock cannot be negative."
                });

            var medicine = new Medicine
            {
                MedicineName = request.MedicineName.Trim(),
                Manufacturer = request.Manufacturer,
                Description = request.Description,
                UnitPrice = request.UnitPrice,
                StockQuantity = request.StockQuantity,
                IsActive = request.IsActive
            };

            _context.Medicines.Add(medicine);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMedicine),
                new { id = medicine.MedicineId },
                new
                {
                    message = "Medicine added successfully.",
                    medicine
                });
        }

        // PUT: api/medicines/1
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateMedicine(
            int id,
            [FromBody] MedicineRequest request)
        {
            var medicine = await _context.Medicines.FindAsync(id);

            if (medicine == null)
                return NotFound(new
                {
                    message = "Medicine not found."
                });

            if (string.IsNullOrWhiteSpace(request.MedicineName))
                return BadRequest(new
                {
                    message = "Medicine name is required."
                });

            if (request.UnitPrice < 0 || request.StockQuantity < 0)
                return BadRequest(new
                {
                    message = "Price and stock cannot be negative."
                });

            medicine.MedicineName = request.MedicineName.Trim();
            medicine.Manufacturer = request.Manufacturer;
            medicine.Description = request.Description;
            medicine.UnitPrice = request.UnitPrice;
            medicine.StockQuantity = request.StockQuantity;
            medicine.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Medicine updated successfully.",
                medicine
            });
        }

        // DELETE: api/medicines/1
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);

            if (medicine == null)
                return NotFound(new
                {
                    message = "Medicine not found."
                });

            var isUsed = await _context.PrescriptionItems
                .AnyAsync(p => p.MedicineId == id);

            if (isUsed)
                return Conflict(new
                {
                    message = "Medicine is already used in prescriptions. Deactivate it instead."
                });

            _context.Medicines.Remove(medicine);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Medicine deleted successfully."
            });
        }
    }

    public class MedicineRequest
    {
        public string MedicineName { get; set; } = string.Empty;
        public string? Manufacturer { get; set; }
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
