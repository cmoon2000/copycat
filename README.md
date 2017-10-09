This is a game [copycat](https://codepen.io/Gthibaud/pen/ryQRYP) from [gtibo](https://codepen.io/Gthibaud) that I've tried and decided to make typescript code from it. Just experience with typescript + Webpack.

Because of I use NODE_PATH system variable to yarn global packages, using Powershell:
```powershell
$ $env:NODE_PATH="C:\Users\haind\AppData\Local\Yarn\config\glob
al\node_modules"
```

Otherwise, you can fetch typescript, webpack via:
```powershell
$ yarn add -D typescript webpack
```

To run it, type following in Powershell and open index.html in browser
```powershell
$ yarn run watch
```
