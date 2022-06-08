import { Action, ActionCreator, ActionReducer, Creator } from "@ngrx/store";
import { OnReducer, ReducerTypes } from "@ngrx/store/src/reducer_creator";
import { EMPTY, filter, mergeMap, of, OperatorFunction } from "rxjs";

export interface Event extends Action {
    readonly verb: string;
    readonly source: string;
    [other: string]: any;
}

export function toEvent(source: string = "", verb: string): Event {
    return {
        verb,
        source,
        type: `[${source}] ${verb}`,
    };
}

export type EventCreator = () => Event;
export type EventCreatorWithParam<P> = (param: P) => Event;

export function createEvent(source: string, verb: string): EventCreator;
export function createEvent<P>(
    source: string,
    verb: string,
    config: P
): EventCreatorWithParam<P>;
export function createEvent<P>(
    source: string,
    verb: string,
    config?: P
): EventCreator | EventCreatorWithParam<P> {
    if (!config) return () => toEvent(source, verb);

    return (prop: P) => ({
        ...prop,
        verb,
        source,
        type: `[${source}] ${verb}`,
    });
}

export type EventAssembler = (source: string) => Event;
export type EventAssemblerWithParam<P> = (source: string, param: P) => Event;

export function prepareEvent(verb: string): EventAssembler;
export function prepareEvent<P>(
    verb: string,
    config: P
): EventAssemblerWithParam<P>;
export function prepareEvent<VerbType extends string, P>(
    verb: VerbType,
    config?: P
): EventAssembler | EventAssemblerWithParam<P> {
    if (!config) {
        return (source: string) => toEvent(source, verb);
    }

    return (source: string, prop: P) => ({
        ...prop,
        verb,
        source,
        type: `[${source}] ${verb}`,
    });
}

export function onEvent<Payload>(
    ...allowedTypes: Array<string | EventAssembler | EventAssemblerWithParam<Payload>>
): OperatorFunction<Action, Action> {
    return filter((action: Action) =>
        allowedTypes.some((typeOrEventAssembler) => {
            if (typeof typeOrEventAssembler === 'string') {
                // Comparing the string to type
                return typeOrEventAssembler === action.type;
            }
            // We are filtering by EventAssembler
            return typeOrEventAssembler("", {} as Payload).verb === action.type;
        })
    );
}

type EA<T> = EventAssembler | EventAssemblerWithParam<T>;
type ExtractActionTypes<Creators extends readonly ActionCreator[]> = {
    [Key in keyof Creators]: Creators[Key] extends ActionCreator<infer T> ? T : never;
};
export function when2<
    State,
    Payload,
    Assemblers extends readonly EA<Payload>[],
    Creators extends readonly ActionCreator[],>(
        ...args: [
            ...assemblers: Assemblers,
            reducer: OnReducer<State extends infer S ? S : never, Creators>
        ]
    ): ReducerTypes<State, Creators> {
    // reducers are not changed
    const reducer = args.pop() as OnReducer<any, Creators>;
    // only assemblers are left in args
    const types = (((args as unknown) as Assemblers).map(
        (creator) => creator("", {} as Payload).verb
    ) as unknown) as ExtractActionTypes<Creators>;
    return { reducer, types };
}

export function e(event: Event): Action {
    return {
        type: event.verb
    };
}