using System;
using System.Security.Cryptography;

namespace GradPath.Api.Domain;

/// <summary>
/// RFC 9562 compliant UUIDv7 generator for .NET 8
/// Generates time-ordered sequential UUIDs
/// </summary>
public static class Uuid7
{
    public static Guid NewGuid()
    {
        byte[] bytes = new byte[16];
        RandomNumberGenerator.Fill(bytes);

        long timestampMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // High 48 bits: timestamp
        bytes[0] = (byte)(timestampMs >> 40);
        bytes[1] = (byte)(timestampMs >> 32);
        bytes[2] = (byte)(timestampMs >> 24);
        bytes[3] = (byte)(timestampMs >> 16);
        bytes[4] = (byte)(timestampMs >> 8);
        bytes[5] = (byte)timestampMs;

        // Version 7: set bits 4-7 of byte 6 to 0111
        bytes[6] = (byte)((bytes[6] & 0x0F) | 0x70);

        // Variant 1 (RFC 4122/9562): set bits 6-7 of byte 8 to 10
        bytes[8] = (byte)((bytes[8] & 0x3F) | 0x80);

        return new Guid(bytes);
    }
}
