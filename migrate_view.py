import os
import re
from ojitos369.utils import printwln as pln

class Migrate:
    def replace_media(self, file):
        file_str = ""
        with open(file, 'r') as f:
            file_str = f.read()
        file_str = file_str.replace('/assets/', '/media/dist/assets/')
        with open(file, 'w') as f:
            f.write(file_str)
        return file_str

    def main(self, *args, **options):
        media_dir = "back/media/dist"
        react_build = "front/dist"

        try:
            os.system(f'rm -rf {media_dir}/')
        except Exception:
            pass
        try:
            os.system(f'mkdir -p {media_dir}/')
        except Exception:
            pass
        try:
            os.system(f'cp -rf {react_build}/* {media_dir}')
        except Exception:
            pass

        self.replace_media(f"{media_dir}/index.html")

        files = os.listdir(f'{media_dir}/assets')
        js_files = [f for f in files if f.endswith('.js')]

        for file_name in js_files:
            pln(file_name)
            js = self.replace_media(f"{media_dir}/assets/{file_name}")
            structure = r'''https?://localhost(:\d+)?'''
            matches = re.finditer(structure, js)
            matches = sorted(matches, key=lambda x: len(x.group(0)), reverse=True)
            for match in matches:
                pln(match.group(0))
                js = js.replace(match.group(0), '')
            with open(f'{media_dir}/assets/{file_name}', 'w') as f:
                f.write(js)

        css_files = [f for f in files if f.endswith('.css')]
        for file_name in css_files:
            pln(file_name)
            self.replace_media(f"{media_dir}/assets/{file_name}")

        pln('Done')


if __name__ == '__main__':
    Migrate().main()
