using System;
using System.Collections.Generic;

namespace ATHClinic.API.Models;

public partial class Medicine
{
    public int MedicineId { get; set; }

    public string MedicineName { get; set; } = null!;

    public string? Manufacturer { get; set; }

    public string? Description { get; set; }

    public decimal UnitPrice { get; set; }

    public int StockQuantity { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
}
