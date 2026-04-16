using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Packages;
using SuperKayyem.Application.Interfaces;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _packages;
    public PackagesController(IPackageService packages) => _packages = packages;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _packages.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _packages.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePackageRequest request)
    {
        var result = await _packages.CreateAsync(request);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePackageRequest request)
    {
        var result = await _packages.UpdateAsync(id, request);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _packages.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
