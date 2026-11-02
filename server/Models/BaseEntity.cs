// ============================================================
// BaseEntity.cs — Base model for all entities
// Every model in the project inherits from this class and gets these shared properties.
// ============================================================

namespace SuperKayyem.Models
{
    // BaseEntity: Base class to inherit from — avoids repeating common fields in every model
    public class BaseEntity
    {
        // Unique identifier for each record in the database (primary key)
        public int Id { get; set; }

        // Date and time when the record is created (set automatically when added)
        public DateTime CreatedAt { get; set; }

        // Flag for soft delete: set to true instead of deleting the record permanently
        // = false: default value — the record is active and not deleted
        public bool IsDeleted { get; set; } = false;

        // Date of soft delete — stays null unless the record is deleted
        // DateTime?: the ? means this property is nullable (can be null)
        public DateTime? DeletedAt { get; set; }

        // Flag showing if the record was updated
        // = false: default value — not updated yet
        public bool IsUpdated { get; set; } = false;

        // Date of the last update — stays null until the first update
        public DateTime? UpdatedAt { get; set; }

        
    }

}