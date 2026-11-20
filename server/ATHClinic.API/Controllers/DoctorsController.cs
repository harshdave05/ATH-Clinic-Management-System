
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace ATHClinic.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly ATHClinicContext _context;

    public DoctorsController(ATHClinicContext context)
    {
        _context = context;
    }

    // GET: api/doctors
    [HttpGet]
    public async Task<IActionResult> GetDoctors()
    {
        var doctors = await _context.Doctors
            .AsNoTracking()
            .ToListAsync();

        return Ok(doctors);
    }

    // GET: api/doctors/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDoctor(int id)
    {
        var doctor = await _context.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DoctorId == id);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        return Ok(doctor);
    }

    // POST: api/doctors
    [HttpPost]
    public async Task<IActionResult> CreateDoctor(
        [FromBody] Doctor doctor)
    {
        if (string.IsNullOrWhiteSpace(doctor.FullName))
            return BadRequest(new { message = "Doctor name is required." });

        if (doctor.ConsultationFee < 0)
            return BadRequest(new { message = "Consultation fee cannot be negative." });

        if (doctor.UserId.HasValue)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.UserId == doctor.UserId.Value);

            if (!userExists)
                return NotFound(new { message = "Linked user not found." });

            var alreadyLinked = await _context.Doctors
                .AnyAsync(d => d.UserId == doctor.UserId.Value);

            if (alreadyLinked)
                return Conflict(new { message = "This user is already linked to a doctor." });
        }

        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetDoctor),
            new { id = doctor.DoctorId },
            doctor
        );
    }

    // PUT: api/doctors/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDoctor(
        int id,
        [FromBody] Doctor updatedDoctor)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        if (string.IsNullOrWhiteSpace(updatedDoctor.FullName))
            return BadRequest(new { message = "Doctor name is required." });

        if (updatedDoctor.ConsultationFee < 0)
            return BadRequest(new { message = "Consultation fee cannot be negative." });

        doctor.FullName = updatedDoctor.FullName;
        doctor.Specialization = updatedDoctor.Specialization;
        doctor.Qualification = updatedDoctor.Qualification;
        doctor.Phone = updatedDoctor.Phone;
        doctor.ConsultationFee = updatedDoctor.ConsultationFee;
        doctor.IsAvailable = updatedDoctor.IsAvailable;

        await _context.SaveChangesAsync();

        return Ok(doctor);
    }

    // DELETE: api/doctors/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors.FindAsync(id);

        if (doctor == null)
            return NotFound(new { message = "Doctor not found." });

        var hasAppointments = await _context.Appointments
            .AnyAsync(a => a.DoctorId == id);

        if (hasAppointments)
            return Conflict(new
            {
                message = "Cannot delete this doctor because appointments are associated with this doctor."
            });

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Doctor deleted successfully."
        });
    }
}
