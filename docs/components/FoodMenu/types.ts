export interface Dish {
  id: string
  name: string
  price: number
  image: string
  category: string
  tags: string[]
  desc: string
  subGroup?: string
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
  price?: number
}

export interface Order {
  id: string
  date: string
  time: string
  createdAt?: string
  items: OrderItem[]
  total: number
  status: '已完成' | '配送中' | '待确认'
  type: 'direct' | 'preorder'
  preDays?: PreOrderDay[]
  pickup?: string
}

export interface PreOrderDay {
  day: string
  date: string
  dishes: string[]
}

export type PageName = 'home' | 'menu' | 'detail' | 'preorder-date' | 'preorder-menu' | 'preorder-summary' | 'profile' | 'order-detail'
