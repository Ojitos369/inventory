from core.bases.apis import BaseApi, prod_mode, dev_mode


class HelloWorld(BaseApi):
    def main(self):
        self.show_me()
        self.response = {"app": "invhome", "ok": True, "message": "Hello World"}


class GetModes(BaseApi):
    def main(self):
        self.response = {"prod_mode": prod_mode, "dev_mode": dev_mode}
