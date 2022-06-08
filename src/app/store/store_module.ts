import { state } from "@angular/animations";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { createAction, createReducer, on, props, Store } from "@ngrx/store";
import { delay, tap, of, mergeMap } from "rxjs";
import { Product, products } from "../products/products";
import { PRODUCT_SAVE_SUCCESS } from "./actions";
import { adapter} from "./base";

const X = createAction('[X] [Products page] Temp action', props<Product>());

const zero_state = adapter.getInitialState();
const initial_state = adapter.setAll(products, zero_state);

export const productReducer = createReducer(initial_state,
    // on(PRODUCT_SAVE_SUCCESS, (state, product) => adapter.updateOne(product, state)),
    on(X, (state, product) => adapter.addOne(product, state)),
);

@Injectable({ providedIn: 'root' })
export class RandomEffects {
    constructor(private actions$: Actions, private store: Store) { }

    log$ = createEffect(() =>
        this.actions$.pipe(
            // ofType(PRODUCT_SAVE_SUCCESS),
            ofType('[X] [Products] Save item'),
            tap(x => console.log('Yo PRODUCT_SAVE_SUCCESS is dispatched & log$ effect catched it', x)),
            mergeMap((x: Product) => of(x).pipe(
                delay(3000),
                tap(x => this.store.dispatch(X({ ...x, name: 'peer' })))
            ))
        ),
        { dispatch: false }
    );
}
