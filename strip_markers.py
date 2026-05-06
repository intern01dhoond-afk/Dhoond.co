import sys
import os

file_path = r'c:\Users\balar\Desktop\Dhoond.co\frontend\src\pages\Checkout.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith('<<<<<<<'):
        skip = False # We want the HEAD part
        continue
    if line.startswith('======='):
        skip = True
        continue
    if line.startswith('>>>>>>>'):
        skip = False
        continue
    if not skip:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
