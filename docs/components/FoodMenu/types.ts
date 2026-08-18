export interface Dish {
  id: string
  name: string
  price: number
  image: string
  category: string
  tags: string[]
  desc: string
  ingredients?: {
    main: string
    side: string
    seasonings: string
  }
}

export interface CartItem {
  dish: Dish
  qty: number
}

export interface OrderItem {
  name: string
  qty: number
}

export interface Order {
  id: string
  date: string
  time: string
  items: OrderItem[]
  total: number
  status: '已完成' | '配送中' | '待确认'
  type: 'direct' | 'preorder'
  preDays?: PreOrderDay[]
}

export interface PreOrderDay {
  day: string
  date: string
  dishes: string[]
}

export type PageName = 'home' | 'menu' | 'detail' | 'preorder-date' | 'preorder-menu' | 'preorder-summary' | 'profile'
