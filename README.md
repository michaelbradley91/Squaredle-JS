# Squaredle JS

An attempt to implement a locally playable version of Squaredle.

## Libraries and Tools

* [Phaser](https://phaser.io/)
* [Yoga layout](https://www.yogalayout.dev/docs/about-yoga)
* [Vite](https://vite.dev/)
* [FontBMSharp](https://github.com/benbaker76/FontBMSharp)

And of course NPM and other tools. Explore the repository for everything used.

## Font Generation

Making fonts crisp in Phaser 3 is surprisingly difficult!! I'm now using Bitmap fonts of various sizes.
These were generated with FontBMSharp with the following commands:

```bash
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=12 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-12.png
Ren Roboto-Regular.fnt Roboto-Regular-12.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=16 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-16.png
Ren Roboto-Regular.fnt Roboto-Regular-16.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=24 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-24.png
Ren Roboto-Regular.fnt Roboto-Regular-24.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=32 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-32.png
Ren Roboto-Regular.fnt Roboto-Regular-32.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=48 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-48.png
Ren Roboto-Regular.fnt Roboto-Regular-48.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=64 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-64.png
Ren Roboto-Regular.fnt Roboto-Regular-64.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=80 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-80.png
Ren Roboto-Regular.fnt Roboto-Regular-80.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=128 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-128.png
Ren Roboto-Regular.fnt Roboto-Regular-128.fnt
FontBMSharp Roboto-Regular.ttf . -chars=32-126 -font-size=144 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Regular.png Roboto-Regular-144.png
Ren Roboto-Regular.fnt Roboto-Regular-144.fnt

FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=12 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-12.png
Ren Roboto-Bold.fnt Roboto-Bold-12.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=16 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-16.png
Ren Roboto-Bold.fnt Roboto-Bold-16.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=24 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-24.png
Ren Roboto-Bold.fnt Roboto-Bold-24.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=32 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-32.png
Ren Roboto-Bold.fnt Roboto-Bold-32.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=48 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-48.png
Ren Roboto-Bold.fnt Roboto-Bold-48.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=64 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-64.png
Ren Roboto-Bold.fnt Roboto-Bold-64.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=80 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-80.png
Ren Roboto-Bold.fnt Roboto-Bold-80.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=128 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-128.png
Ren Roboto-Bold.fnt Roboto-Bold-128.fnt
FontBMSharp Roboto-Bold.ttf . -chars=32-126 -font-size=144 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold.png Roboto-Bold-144.png
Ren Roboto-Bold.fnt Roboto-Bold-144.fnt

FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=12 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-12.png
Ren Roboto-Italic.fnt Roboto-Italic-12.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=16 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-16.png
Ren Roboto-Italic.fnt Roboto-Italic-16.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=24 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-24.png
Ren Roboto-Italic.fnt Roboto-Italic-24.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=32 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-32.png
Ren Roboto-Italic.fnt Roboto-Italic-32.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=48 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-48.png
Ren Roboto-Italic.fnt Roboto-Italic-48.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=64 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-64.png
Ren Roboto-Italic.fnt Roboto-Italic-64.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=80 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-80.png
Ren Roboto-Italic.fnt Roboto-Italic-80.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=128 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-128.png
Ren Roboto-Italic.fnt Roboto-Italic-128.fnt
FontBMSharp Roboto-Italic.ttf . -chars=32-126 -font-size=144 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Italic.png Roboto-Italic-144.png
Ren Roboto-Italic.fnt Roboto-Italic-144.fnt

FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=12 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-12.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-12.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=16 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-16.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-16.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=24 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-24.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-24.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=32 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-32.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-32.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=48 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-48.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-48.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=64 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-64.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-64.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=80 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-80.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-80.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=128 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-128.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-128.fnt
FontBMSharp Roboto-Bold-Italic.ttf . -chars=32-126 -font-size=144 -spacing=4 -color=0,0,0,255 -background-color=255,0,0,0 -texture-size=256x256 -data-format=xml
Ren Roboto-Bold-Italic.png Roboto-Bold-Italic-144.png
Ren Roboto-Bold-Italic.fnt Roboto-Bold-Italic-144.fnt
```
