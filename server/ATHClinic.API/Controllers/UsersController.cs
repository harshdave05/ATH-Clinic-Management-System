
using ATHClinic.API.Data;
using ATHClinic.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ATHClinic.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]

    public class UsersController : ControllerBase
    {
        private readonly ATHClinicContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public UsersController(ATHClinicContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.RoleId,
                    RoleName = u.Role.RoleName,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.RoleId,
                    RoleName = u.Role.RoleName,
                    u.IsActive,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            return Ok(user);
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> CreateUser(UserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new
                {
                    message = "Name, email and password are required."
                });
            }

            if (request.Password.Length < 8)
                return BadRequest(new
                {
                    message = "Password must contain at least 8 characters."
                });

            string email = request.Email.Trim().ToLower();

            bool emailExists = await _context.Users
                .AnyAsync(u => u.Email == email);

            if (emailExists)
                return Conflict(new
                {
                    message = "Email is already registered."
                });

            bool roleExists = await _context.Roles
                .AnyAsync(r => r.RoleId == request.RoleId);

            if (!roleExists)
                return BadRequest(new
                {
                    message = "Invalid RoleId."
                });

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = email,
                RoleId = request.RoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(
                user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.UserId },
                new
                {
                    message = "User registered successfully.",
                    user.UserId,
                    user.FullName,
                    user.Email,
                    user.RoleId,
                    user.IsActive,
                    user.CreatedAt
                });
        }

        // PUT: api/users/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(
            int id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (string.IsNullOrWhiteSpace(request.FullName) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                return Conflict(new
                {
                    message = "Name and email are required."
                });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(currentUserId, out int loggedInUserId) &&
                id == loggedInUserId &&
                user.RoleId != request.RoleId)
            {
                return Conflict(new
                {
                    message = "You cannot change your own role."
                });
            }

            string email = request.Email.Trim().ToLower();

            bool emailExists = await _context.Users.AnyAsync(u =>
                u.UserId != id && u.Email == email);

            if (emailExists)
                return BadRequest(new
                {
                    message = "Email is already used by another user."
                });

            bool roleExists = await _context.Roles
                .AnyAsync(r => r.RoleId == request.RoleId);

            if (!roleExists)
                return BadRequest(new { message = "Invalid RoleId." });

            user.FullName = request.FullName.Trim();
            user.Email = email;
            user.RoleId = request.RoleId;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User updated successfully.",
                user.UserId,
                user.FullName,
                user.Email,
                user.RoleId,
                user.IsActive
            });
        }

        // PATCH: api/users/1/status
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            int id, [FromBody] UserStatusRequest request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Prevent Admin from deactivating their own account
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (int.TryParse(currentUserId, out int loggedInUserId) &&
                id == loggedInUserId &&
                !request.IsActive)
            {
                return Conflict(new
                {
                    message = "You cannot deactivate your own account."
                });
            }

            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User status updated successfully.",
                user.UserId,
                user.IsActive
            });
        }
    }

    public class UserRequest
    {
        public int RoleId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateUserRequest
    {
        public int RoleId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class UserStatusRequest
    {
        public bool IsActive { get; set; }
    }
}
