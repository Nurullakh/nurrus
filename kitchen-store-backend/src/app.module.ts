import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { BannersModule } from './banners/banners.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './products/products.entity';
import { CartItem } from './cart/cart.entity';
import { FavoriteItem } from './favorites/favorites.entity';
import { Order } from './orders/orders.entity';
import { Banner } from './banners/banners.entity';
import { Promotion } from './promotions/promotions.entity';
import { Category } from './categories/categories.entity';
import { User } from './users/users.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/reviews.entity';
import { AddressesModule } from './addresses/addresses.module';
import { Address } from './addresses/addresses.entity';
import { ComparisonsModule } from './comparisons/comparisons.module';
import { Comparison } from './comparisons/comparisons.entity';
import { ViewHistoryModule } from './view-history/view-history.module';
import { ViewHistory } from './view-history/view-history.entity';
import { ContactsModule } from './contacts/contacts.module';
import { ContactRequest } from './contacts/contacts.entity';
import { NewsletterModule } from './newsletter/newsletter.module';
import { NewsletterSubscription } from './newsletter/newsletter.entity';
import { FinancePayout } from './finance/finance-payout.entity';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Product,
        CartItem,
        FavoriteItem,
        Order,
        Banner,
        Promotion,
        Category,
        User,
        Review,
        Address,
        Comparison,
        ViewHistory,
        ContactRequest,
        NewsletterSubscription,
        FinancePayout,
      ],
      synchronize:
        process.env.NODE_ENV !== 'production' ||
        process.env.SCHEMA_SYNC === '1',
      logging: process.env.NODE_ENV !== 'production',
    }),
    ProductsModule,
    CartModule,
    FavoritesModule,
    OrdersModule,
    BannersModule,
    PromotionsModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    ReviewsModule,
    AddressesModule,
    ComparisonsModule,
    ViewHistoryModule,
    ContactsModule,
    NewsletterModule,
    FinanceModule,
  ],
})
export class AppModule {}
