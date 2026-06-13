import math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

W, H, FPS = 1080, 1920, 30
CYAN = (34, 211, 238)
CYAN_D = (14, 165, 196)
INK = (8, 12, 20)
WHITE = (240, 246, 252)

FD = "/mnt/skills/examples/canvas-design/canvas-fonts/"
def F(name, size): return ImageFont.truetype(FD + name, size)
HEAVY  = lambda s: F("BigShoulders-Bold.ttf", s)
DISPLAY= lambda s: F("Outfit-Bold.ttf", s)
MONO   = lambda s: F("JetBrainsMono-Bold.ttf", s)
CHIP   = lambda s: F("InstrumentSans-Bold.ttf", s)

random.seed(7)

# ---------- easing ----------
def clamp(x,a=0.0,b=1.0): return a if x<a else b if x>b else x
def lerp(a,b,t): return a+(b-a)*t
def seg(t,a,b):  return clamp((t-a)/(b-a)) if b>a else 1.0
def eoCubic(t):  return 1-(1-t)**3
def eioCubic(t): return 4*t*t*t if t<0.5 else 1-(-2*t+2)**3/2
def eoBack(t):
    c1=1.70158; c3=c1+1
    return 1+c3*(t-1)**3+c1*(t-1)**2

# ---------- text helpers ----------
def text_w(d,s,font,ls=0):
    w=0
    for ch in s:
        w+=d.textlength(ch,font=font)+ls
    return w-ls if s else 0

def draw_tracked(d,xy,s,font,fill,ls=0,anchor_center=False):
    x,y=xy
    if anchor_center:
        x-=text_w(d,s,font,ls)/2
    for ch in s:
        d.text((x,y),ch,font=font,fill=fill)
        x+=d.textlength(ch,font=font)+ls

def rounded(d,box,r,fill=None,outline=None,width=1):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)

# ---------- assets ----------
phones={}
for k,fn in [("daily","phone_daily.png"),("cycle","phone_cycle.png"),
             ("compound","phone_compound.png"),("shop","phone_shop.png")]:
    im=Image.open("/tmp/"+fn).convert("RGBA")
    PH=1230
    sc=PH/im.height
    phones[k]=im.resize((int(im.width*sc),PH),Image.LANCZOS)
PHW=phones["daily"].width

# phone soft shadow
def phone_shadow(ph):
    sh=Image.new("RGBA",(ph.width+120,ph.height+120),(0,0,0,0))
    a=ph.split()[-1]
    silo=Image.new("RGBA",ph.size,(0,0,0,180)); silo.putalpha(a)
    sh.paste(silo,(60,72),silo)
    return sh.filter(ImageFilter.GaussianBlur(34))
shadows={k:phone_shadow(v) for k,v in phones.items()}

# ---------- background base ----------
def make_base():
    base=Image.new("RGB",(W,H))
    px=base.load()
    top=(6,10,20); bot=(3,6,13)
    for y in range(H):
        t=y/H
        # subtle radial-ish darkening toward edges via vertical gradient
        r=int(lerp(top[0],bot[0],t)); g=int(lerp(top[1],bot[1],t)); b=int(lerp(top[2],bot[2],t))
        for x in range(0,W):
            px[x,y]=(r,g,b)
    # diagonal faint grid
    grid=Image.new("RGBA",(W,H),(0,0,0,0)); gd=ImageDraw.Draw(grid)
    step=70
    for i in range(-H,W,step):
        gd.line([(i,0),(i+H,H)],fill=(34,211,238,12),width=1)
    for i in range(0,W+H,step):
        gd.line([(i,0),(i-H,H)],fill=(120,140,170,7),width=1)
    base=Image.alpha_composite(base.convert("RGBA"),grid)
    # vignette
    vig=Image.new("L",(W,H),0); vd=ImageDraw.Draw(vig)
    vd.ellipse([-W*0.3,-H*0.15,W*1.3,H*1.15],fill=255)
    vig=vig.filter(ImageFilter.GaussianBlur(220))
    dark=Image.new("RGBA",(W,H),(0,0,0,150))
    inv=Image.eval(vig,lambda v:255-v)
    base.paste(dark,(0,0),Image.merge("RGBA",(inv,inv,inv,inv)).split()[-1] and inv.point(lambda v:int(v*0.55)).convert("L"))
    return base.convert("RGB")
BASE=make_base()

# glow sprite
def glow_sprite(rad,col,a=255):
    s=Image.new("RGBA",(rad*2,rad*2),(0,0,0,0)); sd=ImageDraw.Draw(s)
    for i in range(rad,0,-2):
        al=int(a*(i/rad)**2*0.5)
        sd.ellipse([rad-i,rad-i,rad+i,rad+i],fill=(col[0],col[1],col[2],255-int(255*(i/rad))))
    g=Image.new("RGBA",(rad*2,rad*2),(0,0,0,0)); gd=ImageDraw.Draw(g)
    gd.ellipse([0,0,rad*2,rad*2],fill=(col[0],col[1],col[2],a))
    return g.filter(ImageFilter.GaussianBlur(rad*0.55))
GLOW_C=glow_sprite(460,CYAN,120)
GLOW_B=glow_sprite(520,(60,90,160),90)

# particles
PARTS=[(random.uniform(0,W),random.uniform(0,H),random.uniform(1.5,4),random.uniform(0.2,0.7),random.uniform(8,26)) for _ in range(46)]

def background(t):
    img=BASE.copy().convert("RGBA")
    g1x=W*0.5+math.sin(t*0.6)*W*0.34 - GLOW_C.width/2
    g1y=H*0.42+math.cos(t*0.5)*H*0.18 - GLOW_C.height/2
    img.alpha_composite(GLOW_C,(int(g1x),int(g1y)))
    g2x=W*0.5+math.sin(t*0.4+2)*W*0.40 - GLOW_B.width/2
    g2y=H*0.62+math.cos(t*0.45+1)*H*0.20 - GLOW_B.height/2
    img.alpha_composite(GLOW_B,(int(g2x),int(g2y)))
    d=ImageDraw.Draw(img)
    for (px,py,r,al,sp) in PARTS:
        yy=(py - t*sp) % H
        d.ellipse([px-r,yy-r,px+r,yy+r],fill=(34,211,238,int(70*al)))
    return img

# ---------- timeline ----------
HOOK_A,HOOK_B = 0.0, 1.7
HOLD,TRANS    = 1.75, 0.5
STRIP_A       = HOOK_B
order=["daily","cycle","compound","shop"]
# index float
def index_float(t):
    x=t-STRIP_A
    if x<0: return 0.0
    idx=0.0
    for i in range(len(order)):
        if x<=HOLD: return float(i)
        x-=HOLD
        if i<len(order)-1:
            if x<=TRANS: return i+eioCubic(x/TRANS)
            x-=TRANS
        else:
            return float(len(order)-1)
    return float(len(order)-1)
STRIP_B = STRIP_A + len(order)*HOLD + (len(order)-1)*TRANS
CTA_A   = STRIP_B
CTA_B   = CTA_A + 1.9
DUR     = CTA_B

HEADLINES={
 "daily":   ("TRACK EVERY DOSE",   "01 / DAILY PROTOCOL"),
 "cycle":   ("DIAL IN YOUR CYCLE", "02 / CYCLE ENGINE"),
 "compound":("100+ COMPOUNDS",     "03 / RESEARCH LIBRARY"),
 "shop":    ("BUILT-IN SHOP",      "04 / PEPTIDE SHOP"),
}
CHIPS={
 "daily":   ["Daily checklist","Missed-dose alerts","Verification log"],
 "cycle":   ["Dose mapping","Vial supply tracker","Active level 77%"],
 "compound":["BPC-157 · TB-500","Half-life & dosing","Add to your cycle"],
 "shop":    ["Fast USA shipping","$70 / $80 / $99","In stock now"],
}
CHIP_SIDE={ "daily":[0,1,0],"cycle":[1,0,1],"compound":[0,1,0],"shop":[1,0,1] }

PH_CY=1075  # phone center y

def draw_phone(img,key,cx,alpha):
    ph=phones[key]; sh=shadows[key]
    x=int(cx-ph.width/2); y=int(PH_CY-ph.height/2)
    if alpha>=254:
        img.alpha_composite(sh,(x-60,y-60))
        img.alpha_composite(ph,(x,y))
    else:
        a=clamp(alpha/255)
        s2=sh.copy(); s2.putalpha(s2.split()[-1].point(lambda v:int(v*a))); img.alpha_composite(s2,(x-60,y-60))
        p2=ph.copy(); p2.putalpha(p2.split()[-1].point(lambda v:int(v*a))); img.alpha_composite(p2,(x,y))

def draw_chip(d,cx,cy,txt,prog,side):
    # prog 0..1 fly-in; side 0=left enters from left, 1=right from right
    f=CHIP(33)
    pad=26; tw=text_w(d,txt,f); w=tw+pad*2; h=70
    appear=eoCubic(clamp(prog/0.5))
    if prog<=0: return
    offx=(1-appear)*(-260 if side==0 else 260)
    x=cx-w/2+offx; y=cy-h/2
    al=int(255*appear)
    chip=Image.new("RGBA",(int(w)+8,h+8),(0,0,0,0)); cd=ImageDraw.Draw(chip)
    rounded(cd,[4,4,w+4,h+4],h/2,fill=(12,20,30,int(225*appear)),outline=(34,211,238,al),width=2)
    cd.ellipse([20,h/2-3,30,h/2+7],fill=(34,211,238,al))
    cd.text((44,h/2-22),txt,font=f,fill=(232,244,250,al))
    d._image.alpha_composite(chip,(int(x),int(y)))

def headline_block(img,key,prog):
    d=ImageDraw.Draw(img)
    head,tag=HEADLINES[key]
    BY=430  # bottom of headline block, sits above phone top (~460)
    words=head.split(" ")
    if len(words)<=2:
        lines=[head]
    else:
        half=(len(words)+1)//2
        lines=[" ".join(words[:half])," ".join(words[half:])]
    fs=124
    while fs>62:
        hf=HEAVY(fs)
        if max(text_w(d,l,hf,2) for l in lines)<=980: break
        fs-=4
    hf=HEAVY(fs); lh=int(fs*0.90)
    top=BY-lh*len(lines)
    ta=eoCubic(clamp(prog/0.45)); tf=MONO(28)
    draw_tracked(d,(W/2,int(top-56+(1-ta)*16)),tag,tf,(34,211,238,int(255*ta)),ls=6,anchor_center=True)
    for i,l in enumerate(lines):
        lp=clamp((prog-0.08*i)/0.5)
        yy=top+i*lh+(1-eoCubic(lp))*44
        al=int(255*clamp((prog-0.08*i)/0.4))
        draw_tracked(d,(W/2,int(yy)),l,hf,(240,246,252,al),ls=2,anchor_center=True)
    uw=lerp(0,300,eoCubic(clamp((prog-0.2)/0.5)))
    uy=BY+8
    d.rounded_rectangle([W/2-uw/2,uy,W/2+uw/2,uy+8],4,fill=CYAN)

def progress_bar(img,t):
    d=ImageDraw.Draw(img)
    p=clamp(t/DUR)
    d.rounded_rectangle([80,H-70,W-80,H-58],6,fill=(255,255,255,30))
    d.rounded_rectangle([80,H-70,80+(W-160)*p,H-58],6,fill=CYAN)

# logo badge
def draw_logo(d,cx,cy,scale=1.0,alpha=255):
    s=int(96*scale); r=int(26*scale)
    box=[cx-s/2,cy-s/2,cx+s/2,cy+s/2]
    d.rounded_rectangle(box,r,fill=(15,22,33,alpha),outline=(34,211,238,alpha),width=max(2,int(3*scale)))
    lf=HEAVY(int(70*scale))
    draw_tracked(d,(cx,cy-int(40*scale)),"LR",lf,(34,211,238,alpha),ls=2,anchor_center=True)

def frame(t):
    img=background(t)
    d=ImageDraw.Draw(img)
    if t<HOOK_B-0.05:
        # HOOK: brand reveal
        p=seg(t,HOOK_A,HOOK_B)
        sc=lerp(0.6,1.0,eoBack(clamp(p/0.6)))
        al=int(255*clamp(p/0.3))
        cx,cy=W/2,H/2-120
        # logo + wordmark
        draw_logo(d,cx,cy-150,scale=sc*1.6,alpha=al)
        wf=HEAVY(int(150*sc))
        draw_tracked(d,(cx,cy+ (1-eoCubic(clamp(p/0.5)))*40),"LABRAT",wf,(240,246,252,al),ls=8,anchor_center=True)
        # tagline wipe
        tagf=DISPLAY(46)
        tg="PEPTIDE CYCLES, DIALED IN"
        twp=eoCubic(clamp((p-0.35)/0.5))
        full=text_w(d,tg,tagf,ls=4)
        clip=Image.new("RGBA",(W,120),(0,0,0,0)); cd=ImageDraw.Draw(clip)
        draw_tracked(cd,(W/2,10),tg,tagf,(34,211,238,255),ls=4,anchor_center=True)
        maskw=int(full*twp)
        crop=clip.crop((int(W/2-full/2),0,int(W/2-full/2)+maskw,120))
        img.alpha_composite(crop,(int(W/2-full/2),int(cy+200)))
        # quick exit fade near end
        if p>0.85:
            fade=int(255*(1-(p-0.85)/0.15))
            ov=Image.new("RGBA",(W,H),(3,6,13,255-fade));
    elif t<CTA_A-0.02:
        idxf=index_float(t)
        # draw phones around current index
        for i,key in enumerate(order):
            cx=W/2+(i-idxf)*(W+40)
            if -PHW< cx-W/2 < W+PHW:
                draw_phone(img,key,cx, 255)
        # headline for nearest settled phone
        cur=int(round(idxf)); cur=max(0,min(len(order)-1,cur))
        # local progress within this phone's hold
        # compute time since this phone became centered
        center_t=STRIP_A+cur*(HOLD+TRANS)
        local=t-center_t
        hp=clamp(local/0.7)
        # hide headline during fast transition
        transition = abs(idxf-round(idxf))>0.04
        if not transition:
            headline_block(img,order[cur],hp)
            # chips
            d2=ImageDraw.Draw(img)
            chs=CHIPS[order[cur]]; sides=CHIP_SIDE[order[cur]]
            ys=[PH_CY-330,PH_CY-30,PH_CY+300]
            for ci,(c,sd) in enumerate(zip(chs,sides)):
                cp=clamp((local-0.25-0.16*ci)/0.6)
                if cp>0:
                    cxx = W/2 + (-250 if sd==0 else 250)
                    draw_chip(d2,cxx,ys[ci],c,cp,sd)
        progress_bar(img,t)
        # corner tag
        ctf=MONO(26)
        draw_tracked(d,(80,150),"LABRAT",ctf,(120,150,175,200),ls=4)
    else:
        # CTA
        p=seg(t,CTA_A,CTA_B)
        cx=W/2
        draw_logo(d,cx,560,scale=1.8*lerp(0.7,1,eoBack(clamp(p/0.5))),alpha=int(255*clamp(p/0.3)))
        wf=HEAVY(170)
        draw_tracked(d,(cx,700+(1-eoCubic(clamp(p/0.5)))*30),"LABRAT",wf,(240,246,252,int(255*clamp(p/0.4))),ls=8,anchor_center=True)
        tagf=DISPLAY(50)
        draw_tracked(d,(cx,900),"TRACK  ·  CALCULATE  ·  SOURCE",tagf,(34,211,238,int(255*clamp((p-0.2)/0.4))),ls=3,anchor_center=True)
        # pill button with pulse
        bp=clamp((p-0.35)/0.4)
        if bp>0:
            pulse=1+0.03*math.sin(t*7)
            bw=560*eoBack(clamp(bp/0.6))*pulse; bh=130*pulse
            by=1130
            glow=Image.new("RGBA",(int(bw)+120,int(bh)+120),(0,0,0,0)); gdr=ImageDraw.Draw(glow)
            gdr.rounded_rectangle([60,60,bw+60,bh+60],bh/2,fill=(34,211,238,90))
            glow=glow.filter(ImageFilter.GaussianBlur(34))
            img.alpha_composite(glow,(int(cx-bw/2-60),int(by-60)))
            d.rounded_rectangle([cx-bw/2,by,cx+bw/2,by+bh],bh/2,fill=CYAN)
            bf=DISPLAY(56)
            draw_tracked(d,(cx,by+int(bh/2)-36),"GET LABRAT",bf,(6,12,20,255),ls=2,anchor_center=True)
        sf=DISPLAY(38)
        draw_tracked(d,(cx,1330),"Free on iOS & Android",sf,(150,175,195,int(255*clamp((p-0.5)/0.4))),ls=1,anchor_center=True)
    return img.convert("RGB")

# ---------- render ----------
import os, sys
if os.environ.get("PREVIEW"):
    for ts in [0.6,1.2,2.3,3.0,4.6,5.3,6.9,7.6,9.0,9.7,10.3,11.0]:
        frame(ts).save(f"/tmp/prev_{int(ts*10):03d}.png")
        print("prev",ts)
    sys.exit(0)
out="/tmp/labrat_motion_ad.mp4"
writer=imageio_ffmpeg.write_frames(out,(W,H),fps=FPS,codec="libx264",quality=5,
        pix_fmt_out="yuv420p",macro_block_size=8,output_params=["-profile:v","high","-movflags","+faststart"])
writer.send(None)
import numpy as np
N=int(DUR*FPS)
for i in range(N):
    t=i/FPS
    fr=frame(t)
    writer.send(np.asarray(fr))
writer.close()
print("DUR",round(DUR,2),"frames",N,"->",out)
