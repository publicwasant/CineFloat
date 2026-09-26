from PIL import Image, ImageDraw
import os

os.makedirs("icons", exist_ok=True)

def generate_icon(size):
    scale = 8
    high_res_size = size * scale

    img = Image.new("RGBA", (high_res_size, high_res_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Sleek dark background
    bg_radius = int(28 * (high_res_size / 128))
    draw.rounded_rectangle(
        [(0, 0), (high_res_size - 1, high_res_size - 1)],
        radius=bg_radius,
        fill=(18, 18, 20, 255)
    )

    s = high_res_size / 128.0
    x1 = int(22 * s)
    y1 = int(30 * s)
    x2 = int((22 + 84) * s)
    y2 = int((30 + 58) * s)
    outer_radius = int(8 * s)
    outline_width = max(1, int(7 * s))

    # Outer screen outline (pure white)
    draw.rounded_rectangle(
        [(x1, y1), (x2, y2)],
        radius=outer_radius,
        outline=(255, 255, 255, 255),
        width=outline_width
    )

    # Inner PiP window (pure white fill)
    ix1 = int(62 * s)
    iy1 = int(50 * s)
    ix2 = int((62 + 36) * s)
    iy2 = int((50 + 28) * s)
    inner_radius = int(4 * s)

    draw.rounded_rectangle(
        [(ix1, iy1), (ix2, iy2)],
        radius=inner_radius,
        fill=(255, 255, 255, 255)
    )

    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

generate_icon(16).save("icons/icon16.png")
generate_icon(48).save("icons/icon48.png")
generate_icon(128).save("icons/icon128.png")
print("Minimalist monochrome icons generated successfully in icons/!")
