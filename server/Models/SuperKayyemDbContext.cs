namespace SuperKayyem.Models;

using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;

public class SuperKayyemDbContext : DbContext
{
    public SuperKayyemDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Story> Stories { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<Article> Articles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Story and its owned Pages and Ratings subdocuments
        modelBuilder.Entity<Story>(entity =>
        {
            entity.ToCollection("Stories");
            entity.OwnsMany(s => s.Pages);
            entity.OwnsMany(s => s.Ratings);
        });

        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToCollection("Accounts");
            entity.OwnsMany(a => a.Children, child =>
            {
                child.Property(c => c.Interests).IsRequired(false);
            });
            entity.OwnsMany(a => a.PurchasedStories);
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.ToCollection("admin_users");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.ToCollection("articles");
        });
    }
}
