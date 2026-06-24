# Squaredle JS

An attempt to implement a locally playable version of Squaredle.

## Libraries and Tools

* [Phaser](https://phaser.io/)
* [Yoga layout](https://www.yogalayout.dev/docs/about-yoga)
* [Vite](https://vite.dev/)
* [FontBMSharp](https://github.com/benbaker76/FontBMSharp)

And of course NPM and other tools. Explore the repository for everything used.

# BB Code

Documentation copied from: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/bbcodetext/

> BBCode¶

> * Bold : [b]text[/b]
> * Weight : [weight=900]text[/weight]
>   * Valid when text does not have bold tag.
> * Italic : [i]text[/i]
> * Color :
>   * [color=red]text[/color]
>   * [color=#FF0000]text[/color]
>   * [color=rgb(255,0,0)]text[/color]
>   * [color=rgba(255,0,0,1)]text[/color]
> * Size : [size=18]text[/size]
> * Family : [family=papyrus]text[/family]
> * Stroke : [stroke]text[/stroke]
> * Stroke with color setting : [stroke=red]text[/stroke]
> * Shadow : [shadow]text[/shadow]
> * Shadow with color setting : [shadow=red]text[/shadow]
> * Underline : [u]text[/u]
> * Underline with color setting : [u=red]text[/u]
> * Strikethrough : [s]text[/s]
> * Strikethrough with color setting : [s=red]text[/s]
> * Background color :
>   * [bgcolor=red]text[/bgcolor]
>   * [bgcolor=#FF0000]text[/bgcolor]
>   * [bgcolor=rgb(255,0,0)]text[/bgcolor]
>   * [bgcolor=rgba(255,0,0,1)]text[/bgcolor]
> * Superscript, subscript : [y=-12]text[y]
> * Letter spacing : [spacing=10]text[/spacing]
> * Image : [img=imgKey]
> * Hit area of words : [area=key]text[/area]
> * Url link : [url=http...]text[/url]
>   * Click this area to open web page on a new tab (window.open(url, > * '_blank'))
>   * Will register hit area with key url:http...
> * Line alignment :
>   * [align=left]text[/align],
>   * [align=center]text[/align],
>   * [align=right]text[/align]
> * Escape : Tags between [esc] ... [/esc] or [raw] ... [/raw] will be treated as content.
>   * [esc][color=yellow]Text[/color][/esc]
>   * [esc][raw]Text[/raw][/esc]
>   * [raw][esc]Text[/esc][/raw]
>   * [raw][b]Text[/b][/raw]
> * Do nothing, just a marker :
>   * [id=0][color=red]Text[/id]TextText[/color]
