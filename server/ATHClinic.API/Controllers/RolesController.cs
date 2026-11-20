
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ATHClinic.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly ATHClinicContext _context;

        private static readonly string[] SystemRoles =
        {
            "Admin",
            "Doctor",
            "Receptionist"
        };

        public RolesController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/roles
        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .ToListAsync();

            return Ok(roles);
        }

        // GET: api/roles/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RoleId == id);

            if (role == null)
                return NotFound(new { message = "Role not found." });

            return Ok(role);
        }

        // POST: api/roles
        [HttpPost]
        public async Task<IActionResult> CreateRole(RoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RoleName))
                return BadRequest(new { message = "Role name is required." });

            var roleName = request.RoleName.Trim();

            bool exists = await _context.Roles
                .AnyAsync(r => r.RoleName.ToLower() == roleName.ToLower());

            if (exists)
                return Conflict(new { message = "This role already exists." });

            var role = new Role
            {
                RoleName = roleName,
                Description = request.Description?.Trim()
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetRole),
                new { id = role.RoleId },
                new
                {
                    message = "Role created successfully.",
                    role
                });
        }

        // PUT: api/roles/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateRole(
            int id, RoleRequest request)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
                return NotFound(new { message = "Role not found." });

            if (string.IsNullOrWhiteSpace(request.RoleName))
                return BadRequest(new { message = "Role name is required." });

            var roleName = request.RoleName.Trim();

            // Prevent renaming default system roles
            if (SystemRoles.Contains(
                role.RoleName,
                StringComparer.OrdinalIgnoreCase))
            {
                return Conflict(new
                {
                    message = "Default system roles cannot be renamed."
                });
            }

            bool exists = await _context.Roles.AnyAsync(r =>
                r.RoleId != id &&
                r.RoleName.ToLower() == roleName.ToLower());

            if (exists)
                return Conflict(new
                {
                    message = "This role name is already in use."
                });

            role.RoleName = roleName;
            role.Description = request.Description?.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Role updated successfully.",
                role
            });
        }

        // DELETE: api/roles/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
                return NotFound(new { message = "Role not found." });

            // Prevent deleting default system roles
            if (SystemRoles.Contains(
                role.RoleName,
                StringComparer.OrdinalIgnoreCase))
            {
                return Conflict(new
                {
                    message = "Default system roles cannot be deleted."
                });
            }

            bool isAssigned = await _context.Users
                .AnyAsync(u => u.RoleId == id);

            if (isAssigned)
                return Conflict(new
                {
                    message = "This role is assigned to users and cannot be deleted."
                });

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Role deleted successfully." });
        }
    }

    public class RoleRequest
    {
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
