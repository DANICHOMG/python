from flask import Flask, request, jsonify, send_file
import os
import datetime
from docx import Document
import pathlib
import pythoncom
import discord
from discord.ext import commands
from docx2pdf import convert as docx2pdf_convert
import pyimgur
from pdf2image import convert_from_path

app = Flask(__name__)

def fill_template(template_path, data):
    doc = Document(template_path)

    for paragraph in doc.paragraphs:
        for key, value in data.items():
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(key, str(value))

    return doc

def save_document(document, output_directory):
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    output_path = os.path.join(output_directory, f"document_{timestamp}.docx")
    document.save(output_path)
    return output_path

@app.route('/generate_document', methods=['POST'])
def generate_document():
    data = request.json
    category = data['category']
    template_path = get_template_path(category)

    if not template_path:
        return jsonify({"result": "Ошибка: Неверная категория"}), 400

    filled_document = fill_template(template_path, data['data'])
    saved_document_path = save_document(filled_document, "C:\\Users\\SonicMaster\\Downloads")

    word_file = saved_document_path
    pythoncom.CoInitializeEx(0)
    pdf_file = pathlib.Path(word_file)
    pdf_file = pdf_file.stem + '.pdf'
    pythoncom.CoInitializeEx(0)
    docx2pdf_convert(word_file, pdf_file)  # Use the renamed module function
    images = convert_from_path(pdf_file, 500, poppler_path=r'C:\Users\SonicMaster\Downloads\poppler-23.11.0\Library\bin')
   
    if images:
        fname = 'image0.png'
        images[0].save(fname, "PNG")

    CLIENT_ID = "3a258db381635c8"
    PATH = 'C:\\Users\\SonicMaster\\Downloads\\' + fname
    im = pyimgur.Imgur(CLIENT_ID)
    uploaded_image = im.upload_image(PATH, title="Uploaded with PyImgur")
    print(uploaded_image.link)
    return jsonify({"result": f"Готово! Ваше постановление находится тут: **{uploaded_image.link}**. **Не забудьте добавить подпись!**"})


def get_template_path(category):
    if category == '1':
        return "C:\\Users\\SonicMaster\\Downloads\\shablon.docx"
    if category == '2':
        return "C:\\Users\\SonicMaster\\Downloads\\shablon2.docx"
    if category == '3':
        return "C:\\Users\\SonicMaster\\Downloads\\shablon4.docx"
    else:
        return None

if __name__ == '__main__':
    app.run(port=5000)
