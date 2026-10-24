import os
from playwright.sync_api import sync_playwright
d=os.path.dirname(os.path.abspath(__file__))
with sync_playwright() as p:
    try: b=p.chromium.launch()
    except Exception: b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    for n in ['01-cover','02-page-spread','03-pokepod','04-bambo-chat']:
        pg.goto(f'file://{d}/{n}.html'); pg.wait_for_load_state('networkidle'); pg.evaluate('document.fonts.ready')
        print(n, pg.evaluate("['Saira Stencil One','Share Tech Mono','IBM Plex Sans','Caveat'].map(f=>f+':'+document.fonts.check('16px \"'+f+'\"'))"))
        pg.screenshot(path=f'{d}/../{n}.png')
    b.close()
