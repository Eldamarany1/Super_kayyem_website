namespace SuperKayyem.Models;

using Microsoft.EntityFrameworkCore;

public class SuperKayyemDbContext : DbContext
{
    public SuperKayyemDbContext(DbContextOptions<SuperKayyemDbContext> options) : base(options)
    {
    }

    public DbSet<Story> Stories { get; set; }
    public DbSet<Account> Accounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Story and its owned Pages subdocuments
        modelBuilder.Entity<Story>(entity =>
        {
            entity.OwnsMany(s => s.Pages);
        });

        modelBuilder.Entity<Account>(entity =>
        {
            entity.OwnsMany(a => a.Children);
        });
    }
}
