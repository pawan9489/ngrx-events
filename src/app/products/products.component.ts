import { Component, Input, OnInit } from '@angular/core';
import { EntityState } from '@ngrx/entity';
import { createFeatureSelector, createSelector, Store } from '@ngrx/store';
import { map, Observable, tap } from 'rxjs';
import { PRODUCT_SAVE_SUCCESS } from '../store/actions';
import { productsSelector, XState } from '../store/base';
import { Product } from './products';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  constructor(private readonly store: Store) {
    console.log(store);
  }

  products$!: Observable<Product[]>;

  ngOnInit(): void {
    this.products$ = this.store.select(createSelector(createFeatureSelector<EntityState<Product>>('products'), productsSelector)).pipe(
      tap(console.log),
    );
  }

  addProduct() {
    this.store.dispatch(PRODUCT_SAVE_SUCCESS({
      name: 'Rice cake',
      id: 10,
      price: 10,
      quantity: 2
    }));
  }
}
