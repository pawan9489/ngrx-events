import { createSelector } from "@ngrx/store";
import { Product, products } from "../products/products";
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";

export interface State extends EntityState<Product> { }

export function selectUserId(a: Product): number {
    //In this case this would be optional since primary key is id
    return a.id;
}

export function sortByName(a: Product, b: Product): number {
    return a.name.localeCompare(b.name);
}

export const adapter: EntityAdapter<Product> = createEntityAdapter<Product>({
    selectId: selectUserId,
    sortComparer: sortByName,
});

export interface XState {
    products: State
}

export const productsSelector = adapter.getSelectors().selectAll;
