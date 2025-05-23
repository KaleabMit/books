from rembg import remove
from PIL import Image
import io
import os

# Load your image
input_path = 'input.jpg'  # Change this path dynamically if needed
output_path = 'output'

# Open the input image
with open(input_path, 'rb') as i:
    input_image = i.read()

# Remove background
output_image = remove(input_image)

# Get the input file extension
input_extension = os.path.splitext(input_path)[1].lower()

# Set the output format based on input extension (default to PNG if no extension matches)
output_extension = 'png' if input_extension not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'] else input_extension[1:]

# Save the result with the same extension
output_file = f"{output_path}.{output_extension}"
with open(output_file, 'wb') as o:
    o.write(output_image)
