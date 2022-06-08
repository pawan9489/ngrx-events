import { createAction, props } from "@ngrx/store";
import { Product } from "../products/products";

export const PRODUCT_SAVE_SUCCESS = createAction('[X] [Products] Save item', props<Product>());