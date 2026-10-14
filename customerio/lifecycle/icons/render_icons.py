import re, subprocess, sys
from PIL import Image
S=sys.argv[1]; D=S+'/icons-src'; OUT=S+'/icons-out'
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
names=['x-twitter','linkedin-in','instagram']
def shot(sizes, tag):
    cells=''
    for i,n in enumerate(names):
        svg=open(f'{D}/{n}.svg').read()
        svg=re.sub(r'<!--.*?-->','',svg).replace('<svg ',f'<svg width="{sizes[n]}" height="{sizes[n]}" fill="#6b7280" ',1)
        cells+=f'<div style="position:absolute;left:{i*48}px;top:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center">{svg}</div>'
    html=f'<!doctype html><html><body style="margin:0;background:transparent">{cells}</body></html>'
    open(f'{S}/icons-{tag}.html','w').write(html)
    subprocess.run([CH,'--headless=new','--disable-gpu','--hide-scrollbars','--default-background-color=00000000','--force-device-scale-factor=1','--window-size=144,48',f'--screenshot={S}/icons-{tag}.png',f'file://{S}/icons-{tag}.html'],capture_output=True)
    im=Image.open(f'{S}/icons-{tag}.png').convert('RGBA')
    out={}
    for i,n in enumerate(names):
        c=im.crop((i*48,0,i*48+48,48)); a=c.getchannel('A')
        bb=a.point(lambda v:255 if v>40 else 0).getbbox(); ink=sum(v for v in a.getdata())/255/2304
        out[n]=(c,bb,ink)
    return out
# pass 1: same svg box size; measure glyph extents
r=shot({n:40 for n in names},'p1')
target=34  # glyph's larger side = 34px of 48 (17px at 24px display)
sizes={}
for n,(c,bb,ink) in r.items():
    ext=max(bb[2]-bb[0],bb[3]-bb[1]); t={"linkedin-in":31}.get(n,target); sizes[n]=round(40*t/ext)
r=shot(sizes,'p2')
for n,(c,bb,ink) in r.items():
    c.save(f'{OUT}/social-{n}.png')
    print(f'{n:12} svg box {sizes[n]}px -> glyph {bb[2]-bb[0]}x{bb[3]-bb[1]}  ink {ink:.0%}')
