const fs = require('fs')
const path = require('path')

const file = path.resolve('docs/components/FoodMenu/data.ts')
let s = fs.readFileSync(file, 'utf-8')

// 匹配每个菜品对象块
const dishRe = /\{\s*id:\s*'[^']*',\s*name:\s*'([^']*)'[^}]*?image:\s*img\('[^']*'\)/gs

s = s.replace(dishRe, (m, name) => {
  // 把块内的 image: img('...') 替换为 image: img('菜名')
  return m.replace(/image:\s*img\('[^']*'\)/, `image: img(${JSON.stringify(name)})`)
})

fs.writeFileSync(file, s, 'utf-8')
console.log('done')
