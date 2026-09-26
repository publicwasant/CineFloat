import struct
import zlib

def write_png(width, height, filepath):
    signature = b'\x89PNG\r\n\x1a\n'

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xFFFFFFFF)

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)
        for x in range(width):
            if (width * 0.2 <= x <= width * 0.8) and (height * 0.25 <= y <= height * 0.75):
                r, g, b, a = 255, 255, 255, 240
            else:
                r, g, b, a = 49, 46, 129, 255
            raw_data.extend([r, g, b, a])

    compressed_data = zlib.compress(bytes(raw_data))
    idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', zlib.crc32(b'IDAT' + compressed_data) & 0xFFFFFFFF)

    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND') & 0xFFFFFFFF)

    with open(filepath, 'wb') as f:
        f.write(signature + ihdr_chunk + idat_chunk + iend_chunk)

write_png(16, 16, 'icon16.png')
write_png(48, 48, 'icon48.png')
write_png(128, 128, 'icon128.png')
print("Icons generated successfully.")
