using Microsoft.EntityFrameworkCore;
using SuperKayyem.Models;

namespace SuperKayyem.Data
{
    public static class AdminUserSeedData
    {
        // =========================================================================
        // 🚨 [تعديل بيانات الـ SUPER ADMIN (ADMIN LEADER) من هنا مستقبلاً] 🚨
        // CHANGE SUPER ADMIN EMAIL & PASSWORD HERE WHEN UPDATING TO PRODUCTION:
        // =========================================================================
        public const string SuperAdminEmail = "AdminLeader123@gmail.com";
        public const string SuperAdminPassword = "Admin12345";
        public const string SuperAdminDisplayName = "Admin Leader (قائد الفريق)";
        // =========================================================================

        public static async Task EnsureSuperAdminSeededAsync(SuperKayyemDbContext context, CancellationToken ct = default)
        {
            var normalizedEmail = SuperAdminEmail.Trim().ToLowerInvariant();

            var existingLeader = await context.AdminUsers
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail, ct);

            if (existingLeader == null)
            {
                bool hasAnyUsers = await context.AdminUsers.AnyAsync(ct);
                int nextId = hasAnyUsers ? (await context.AdminUsers.MaxAsync(u => u.Id, ct)) + 1 : 1;

                var leader = new AdminUser
                {
                    Id = nextId,
                    FullName = SuperAdminDisplayName,
                    Email = SuperAdminEmail.Trim(),
                    Password = SuperAdminPassword,
                    Role = "SuperAdmin",
                    Status = "Approved",
                    RequestedAt = DateTime.UtcNow,
                    ReviewedAt = DateTime.UtcNow
                };

                await context.AdminUsers.AddAsync(leader, ct);
                await context.SaveChangesAsync(ct);
            }
            else
            {
                bool modified = false;

                if (existingLeader.Role != "SuperAdmin")
                {
                    existingLeader.Role = "SuperAdmin";
                    modified = true;
                }

                if (existingLeader.Status != "Approved")
                {
                    existingLeader.Status = "Approved";
                    modified = true;
                }

                if (existingLeader.Password != SuperAdminPassword)
                {
                    existingLeader.Password = SuperAdminPassword;
                    modified = true;
                }

                if (existingLeader.FullName != SuperAdminDisplayName)
                {
                    existingLeader.FullName = SuperAdminDisplayName;
                    modified = true;
                }

                if (modified)
                {
                    await context.SaveChangesAsync(ct);
                }
            }
        }
    }
}
