import { ArrayIterable }  from './iterables/array-iterable';
import { EmptyIterable }  from './iterables/empty-iterable';
import { CountIterable }  from './iterables/count-iterable';
import { MultiIterable }  from './iterables/multi-iterable';
import { SelectIterable }  from './iterables/select-iterable';
import { SelectManyIterable }  from './iterables/select-many-iterable';
import { TakeIterable }  from './iterables/take-iterable';
import { TakeWhileIterable }  from './iterables/take-while-iterable';
import { WhereIterable }  from './iterables/where-iterable';
import { ConcatIterable }  from './iterables/concat-iterable';
import { WindowIterable }  from './iterables/window-iterable';
import { ReverseIterable }  from './iterables/reverse-iterable';
import { ZipIterable }  from './iterables/zip-iterable';
import { DistinctIterable }  from './iterables/distinct-iterable';
import { RollingWindowIterable }  from './iterables/rolling-window-iterable';
import { VariableWindowIterable }  from './iterables/variable-window-iterable';
import { OrderedIterable, Direction, ISortSpec, SelectorFn as SortSelectorFn }  from './iterables/ordered-iterable';
import * as Sugar from 'sugar';
import { IIndex, Index } from './index';
import { ExtractElementIterable } from './iterables/extract-element-iterable';
import { SkipIterable } from './iterables/skip-iterable';
import { SkipWhileIterable } from './iterables/skip-while-iterable';
var Table = require('easy-table');
import { assert } from 'chai';
import { IDataFrame, DataFrame } from './dataframe';
import * as moment from 'moment';
import { isError } from 'util';

/**
 * Series configuration.
 */
export interface ISeriesConfig<IndexT, ValueT> {
    values?: ValueT[] | Iterable<ValueT>,
    index?: IndexT[] | Iterable<IndexT>,
    pairs?: Iterable<[IndexT, ValueT]>
    baked?: boolean,
};

/**
 * A callback function that can be applied to each value.
 */
export type CallbackFn<ValueT> = (value: ValueT, index: number) => void;

//TOOD: Rename SelectorFn and SelectorFnNoIndex.

/**
 * A selector function. Transforms a value into another kind of value.
 */
export type SelectorFn<FromT, ToT> = (value: FromT, index: number) => ToT;

/**
 * Functions to zip together multiple values.
 */
export type ZipNFn<ValueT, ReturnT> = (input: ISeries<number, ValueT>) => ReturnT;
export type Zip2Fn<T1, T2, ReturnT> = (a: T1, b : T2) => ReturnT;
export type Zip3Fn<T1, T2, T3, ReturnT> = (a: T1, b: T2, c: T3) => ReturnT;
export type Zip4Fn<T1, T2, T3, T4, ReturnT> = (a: T1, b: T2, c: T3, d: T4) => ReturnT;
export type Zip5Fn<T1, T2, T3, T4, T5, ReturnT> = (a: T1, b: T2, c: T3, d: T4) => ReturnT;

/**
 * A selector function with no index. Transforms a value into another kind of value.
 */
export type SelectorFnNoIndex<FromT, ToT> = (value: FromT) => ToT;

/**
 * A function that selects a key for a join.
 */
export type JoinSelectorFn<ValueT, ResultT> = (value: ValueT) => ResultT;

/**
 * A function that joins to vlaues.
 */
export type JoinFn<ValueT1, ValueT2, ResultT> = (a: ValueT1, b: ValueT2) => ResultT;

/**
 * A predicate function, returns true or false based on input.
 */
export type PredicateFn<ValueT> = (value: ValueT) => boolean;

/**
 * Defines a function for aggregation.
 */
export type AggregateFn<ValueT, ToT> = (accum: ToT, value: ValueT) => ToT;

/**
 * Compares to values and returns true if they are equivalent.
 */
export type ComparerFn<ValueT1, ValueT2> = (a: ValueT1, b: ValueT2) => boolean;

/*
 * A function that generates a series config object.
 * Used to make it easy to create lazy evaluated series.
 */
export type ConfigFn<IndexT, ValueT> = () => ISeriesConfig<IndexT, ValueT>;

/**
 * Interface that represents a series of indexed values.
 */
export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {

    /**
     * Get an iterator to enumerate the values of the series.
     */
    [Symbol.iterator](): Iterator<ValueT>;

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex<IndexT>;

    /**
     * Apply a new index to the Series.
     * 
     * @param newIndex The new index to apply to the Series.
     * 
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: NewIndexT[] | Iterable<NewIndexT>): ISeries<NewIndexT, ValueT>;

    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new series with the index reset to the default zero-based index. 
     */
    resetIndex (): ISeries<number, ValueT>;

    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): ValueT[];

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pairs is [index, value].
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): ([IndexT,ValueT])[];

     /**
     * Convert the series to a JavaScript object.
     *
     * @param {function} keySelector - Function that selects keys for the resulting object.
     * @param {valueSelector} keySelector - Function that selects values for the resulting object.
     * 
     * @returns {object} Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT;

    /** 
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs (): ISeries<number, [IndexT, ValueT]>;

    /** 
     * Convert a series of pairs to back to a regular series.
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT, NewValueT> (): ISeries<NewIndexT, NewValueT>;
    
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector - Selector function that transforms each value to create a new series or dataframe.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT>;

    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new series with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>;
        
    /**
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /** 
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Group sequential duplicate values into a Series of windows.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series of groups. Each group is itself a series. 
     */
    sequentialDistinct<ToT> (selector: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT>;
    
    /**
     * Aggregate the values in the series.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the series and produces the aggregate value.
     * 
     * @returns Returns a new value that has been aggregated from the input sequence by the 'selector' function. 
     */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT;

    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.  
     */
    percentChange (): ISeries<IndexT, number>;

    /**
     * Skip a number of values in the series.
     *
     * @param numValues Number of values to skip.
     * @returns Returns a new series with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): ISeries<IndexT, ValueT>;
    
    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count (): number;
    
    /**
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first (): ValueT;

    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last (): ValueT;

    /**
     * Get the value at a specified index.
     *
     * @param index - Index to for which to retreive the value.
     *
     * @returns Returns the value from the specified index in the sequence or undefined if there is no such index in the series.
     */
    at (index: IndexT): ValueT | undefined;

    /** 
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): ISeries<IndexT, ValueT>;

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): ISeries<IndexT, ValueT>;

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>;

    /**
     * Determine if the predicate returns truthy for all values in the series.
     * Returns false as soon as the predicate evaluates to falsy.
     * Returns true if the predicate returns truthy for all values in the series.
     * Returns false if the series is empty.
     * 
     * TODO: Should predicate here by optional  as well same as in any and none?
     * 
     * @param predicate - Predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns {boolean} Returns true if the predicate has returned truthy for every value in the sequence, otherwise returns false. 
     */
    all (predicate: PredicateFn<ValueT>): boolean;
    
    /**
     * Determine if the predicate returns truthy for any of the values in the series.
     * Returns true as soon as the predicate returns truthy.
     * Returns false if the predicate never returns truthy.
     * If no predicate is specified the value itself is checked. 
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns Returns true if the predicate has returned truthy for any value in the sequence, otherwise returns false. 
     */
    any (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Determine if the predicate returns truthy for none of the values in the series.
     * Returns true for an empty series.
     * Returns true if the predicate always returns falsy.
     * Otherwise returns false.
     * If no predicate is specified the value itself is checked.
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     * 
     * @returns Returns true if the predicate has returned truthy for no values in the series, otherwise returns false. 
     */
    none (predicate?: PredicateFn<ValueT>): boolean;

    /**
     * Get a new series containing all values starting at and after the specified index value.
     * 
     * @param indexValue - The index value to search for before starting the new series.
     * 
     * @returns Returns a new series containing all values starting at and after the specified index value. 
     */
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up to the specified inde value. 
     */
    before (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for.
     * 
     * @returns Returns a new series containing all values after the specified index value.
     */
    after (indexValue: IndexT): ISeries<IndexT, ValueT>;

    /**
     * Get a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>;

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string;

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): ISeries<IndexT, ValueT>;

    /** 
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate<ToT> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT>;

    /**
     * Sum the values in a series.
     * 
     * @returns Returns the sum of the number values in the series.
     */
    sum (): number;

    /**
     * Average the values in a series.
     * 
     * @returns Returns the average of the number values in the series.
     */
    average (): number;

    /**
     * Get the median value in the series. Not this sorts the series, so can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     */
    median (): number;

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     */
    min (): number;

    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     */
    max (): number;

    /** 
     * Reverse the series.
     * 
     * @returns Returns a new series that is the reverse of the input.
     */
    reverse (): ISeries<IndexT, ValueT>;

    /**
     * Returns only values in the series that have distinct values.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT>;

    /**
     * Group the series according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorFnNoIndex<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;

    /**
     * Group sequential values into a Series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFnNoIndex<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>;
    
    /**
     * Concatenate multiple other series onto this series.
     * 
     * @param series - Multiple arguments. Each can be either a series or an array of series.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT>;

    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 - Multiple series to zip.
    * @param zipper - Zipper function that produces a new series based on the input series.
    * 
    * @returns Returns a single series concatenated from multiple input series. 
    */    
   zip<Index2T, Value2T, ResultT>  (s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
   zip<ResultT>  (...args: any[]): ISeries<IndexT, ResultT>;
   
    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /**
     * Returns the unique union of values between two series.
     *
     * @param other - The other Series or DataFrame to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two series.
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: JoinSelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Returns the intersection of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the intersection of two series.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: JoinSelectorFn<ValueT, KeyT>,
        innerSelector?: JoinSelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

    /**
     * Returns the exception of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the difference between the two series.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: JoinSelectorFn<ValueT, KeyT>,
        innerSelector?: JoinSelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT>;

 /**
     * Correlates the elements of two series on matching keys.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined series. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Performs an outer join on two series. Correlates the elements based on matching keys.
     * Includes elements from both series that have no correlation in the other series.
     *
     * @param this - The outer series to join. 
     * @param inner - The inner series to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined series. 
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Performs a left outer join on two series. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;

    /**
     * Performs a right outer join on two series. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT>;
}

/**
 * Interface to a series that has been ordered.
 */
export interface IOrderedSeries<IndexT = number, ValueT = any, SortT = any> extends ISeries<IndexT, ValueT> {

    /** 
     * Performs additional sorting (ascending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>;
}

//
// Helper function to map an array of objects.
//
export function toMap(items: Iterable<any>, keySelector: (item: any) => any, valueSelector: (item: any) => any): any {
    let output: any = {};
    for (const item of items) {
        var key = keySelector(item);
        output[key] = valueSelector(item);
    }
    return output;
}

//
// Represents the contents of a series.
//
interface ISeriesContent<IndexT, ValueT> {
    index: Iterable<IndexT>; // Initalizers here just to prevent warnings.
    values: Iterable<ValueT>;
    pairs: Iterable<[IndexT, ValueT]>;

    //
    // Records if a series is baked into memory.
    //
    isBaked: boolean;
}

/**
 * Class that represents a series of indexed values.
 */
export class Series<IndexT = number, ValueT = any> implements ISeries<IndexT, ValueT> {

    //
    // Function to lazy evaluate the configuration of a series.
    //
    private configFn: ConfigFn<IndexT, ValueT> | null = null;

    //
    // The content of the series.
    // When this is null it means the series is yet to be lazy initialised.
    //
    private content: ISeriesContent<IndexT, ValueT> | null = null;

    private static readonly defaultCountIterable = new CountIterable();
    private static readonly defaultEmptyIterable = new EmptyIterable();

    //
    // Initialise this Series from an array.
    //
    private static initFromArray<IndexT, ValueT>(arr: ValueT[]): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series.defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([Series.defaultCountIterable, arr]),
            isBaked: true,
        };
    }

    //
    // Initialise an empty DataFrame.
    //
    private static initEmpty<IndexT, ValueT>(): ISeriesContent<IndexT, ValueT> {
        return {
            index: Series.defaultEmptyIterable,
            values: Series.defaultEmptyIterable,
            pairs: Series.defaultEmptyIterable,
            isBaked: true,
        };
    }

    private static initIterable<T>(input: T[] | Iterable<T>, fieldName: string): Iterable<T> {
        if (Sugar.Object.isArray(input)) {
            return input;
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of Series config object to be an array of values or an iterable of values.");
        }
    };

    //
    // Initialise the Series from a config object.
    //
    private static initFromConfig<IndexT, ValueT>(config: ISeriesConfig<IndexT, ValueT>): ISeriesContent<IndexT, ValueT> {

        let index: Iterable<IndexT>;
        let values: Iterable<ValueT>;
        let pairs: Iterable<[IndexT, ValueT]>;
        let isBaked = false;

        if (config.index) {
            index = this.initIterable<IndexT>(config.index, 'index');
        }
        else if (config.pairs) {
            index = new ExtractElementIterable(config.pairs, 0);
        }
        else {
            index = new CountIterable();
        }

        if (config.values) {
            values = this.initIterable<ValueT>(config.values, 'values');
        }
        else if (config.pairs) {
            values = new ExtractElementIterable(config.pairs, 1);
        }
        else {
            values = new EmptyIterable();
        }

        if (config.pairs) {
            pairs = config.pairs;
        }
        else {
            pairs = new MultiIterable([index, values]);
        }

        if (config.baked !== undefined) {
            isBaked = config.baked;
        }

        return {
            index: index,
            values: values,
            pairs: pairs,
            isBaked: isBaked,
        };
    }

    /**
     * Create a series.
     * 
     * @param config This can be either an array or a config object the sets the values that the series contains.
     * If it is an array it specifies the values that the series contains.
     * If it is a config object that can contain:
     *      values: Optional array or iterable of values that the series contains.
     *      index: Optional array or iterable of values that index the series, defaults to a series of integers from 1 and counting upward.
     *      pairs: Optional iterable of pairs (index and value) that the series contains.
     */
    constructor(config?: ValueT[] | ISeriesConfig<IndexT, ValueT> | ConfigFn<IndexT, ValueT>) {
        if (config) {
            if (Sugar.Object.isFunction(config)) {
                this.configFn = config;
            }
            else if (Sugar.Object.isArray(config)) {
                this.content = Series.initFromArray(config);
            }
            else {
                this.content = Series.initFromConfig(config);
            }
        }
        else {
            this.content = Series.initEmpty();
        }
    }

    //
    // Ensure the series content has been initialised.
    //
    private lazyInit() {
        if (this.content === null && this.configFn !== null) {
            this.content = Series.initFromConfig(this.configFn());
        }
    }

    //
    // Ensure the series content is lazy initalised and return it.
    //
    private getContent(): ISeriesContent<IndexT, ValueT> { 
        this.lazyInit();
        return this.content!;
    }

    /**
     * Get an iterator to enumerate the values of the series.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    [Symbol.iterator](): Iterator<ValueT> {
        return this.getContent().values[Symbol.iterator]();
    }

    /**
     * Get the index for the series.
     */
    getIndex (): IIndex<IndexT> {
        return new Index<IndexT>({ values: this.getContent().index }); //TODO: Index should be able to take a config function.
    }

    /**
     * Apply a new index to the Series.
     * 
     * @param newIndex The new index to apply to the Series.
     * 
     * @returns Returns a new series with the specified index attached.
     */
    withIndex<NewIndexT> (newIndex: IIndex<NewIndexT> | ISeries<any, NewIndexT> | NewIndexT[]): ISeries<NewIndexT, ValueT> {

        if (!Sugar.Object.isArray(newIndex)) {
            assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'Series.withIndex' to be an array, Series or Index.");
        }

        return new Series<NewIndexT, ValueT>(() => ({
            values: this.getContent().values,
            index: newIndex,
        }));
    };

    /**
     * Resets the index of the series back to the default zero-based sequential integer index.
     * 
     * @returns Returns a new series with the index reset to the default zero-based index. 
     */
    resetIndex (): ISeries<number, ValueT> {
        return new Series<number, ValueT>(() => ({
            values: this.getContent().values // Just strip the index.
        }));
    }
    
    /**
    * Extract values from the series as an array.
    * This forces lazy evaluation to complete.
    * 
    * @returns Returns an array of values contained within the series. 
    */
    toArray (): any[] {
        var values = [];
        for (const value of this.getContent().values) {
            if (value !== undefined) {
                values.push(value);
            }
        }
        return values;
    }

    /**
     * Retreive the index and values from the Series as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     * 
     * @returns Returns an array of pairs that contains the series content. Each pair is a two element array that contains an index and a value.  
     */
    toPairs (): ([IndexT, ValueT])[] {
        var pairs: [IndexT, ValueT][] = [];
        for (const pair of this.getContent().pairs) {
            if (pair[1] != undefined) {
                pairs.push(pair);
            }
        }
        return pairs;
    }

    /**
     * Convert the series to a JavaScript object.
     *
     * @param {function} keySelector - Function that selects keys for the resulting object.
     * @param {valueSelector} keySelector - Function that selects values for the resulting object.
     * 
     * @returns {object} Returns a JavaScript object generated from the input sequence by the key and value selector funtions. 
     */
    toObject<KeyT = any, FieldT = any, OutT = any> (keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {

        assert.isFunction(keySelector, "Expected 'keySelector' parameter to Series.toObject to be a function.");
        assert.isFunction(valueSelector, "Expected 'valueSelector' parameter to Series.toObject to be a function.");

        return toMap(this, keySelector, valueSelector);
    }
    
    /** 
     * Convert a series or a dataframe to a series of pairs in the form [pair1, pair2, pair3, ...] where each pair is [index, value].
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns {Pairs} Returns a series of pairs for each index and value pair in the input sequence.
     */
    asPairs (): ISeries<number, [IndexT, ValueT]> {
        return new Series<number, [IndexT, ValueT]>(() => ({ values: this.getContent().pairs }));
    }

    /** 
     * Convert a series of pairs to back to a regular series.
     * THIS FUNCTION IS DEPRECATED.
     * 
     * @returns Returns a series of values where each pair has been extracted from the value of the input series.
     */
    asValues<NewIndexT = any, NewValueT = any> (): ISeries<NewIndexT, NewValueT> {

        //TODO: This function didn't port well to TypeScript. It's deprecated though.
        
        return new Series<NewIndexT, NewValueT>(() => ({
            index: new SelectIterable<any, NewIndexT>(this.getContent().values, (pair: [any, any], index: number) => <NewIndexT> pair[0]),
            values: new SelectIterable<any, NewValueT>(this.getContent().values, (pair: [any, any], index: number) => <NewValueT> pair[1]),
            pairs: <Iterable<[NewIndexT, NewValueT]>> <any> this.getContent().values,
        }));
    };
    
    /**
     * Generate a new series based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new series.
     * 
     * @returns Returns a new series that has been transformed by the selector function.
     */
    select<ToT> (selector: SelectorFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.select' function to be a function.");

        return new Series(() => ({
            values: new SelectIterable(this.getContent().values, selector),
            index: this.getContent().index,
        }));
    }

    /**
     * Generate a new series based on the results of the selector function.
     *
     * @param selector Selector function that transforms each value into a list of values.
     * 
     * @returns  Returns a new series with values that have been produced by the selector function. 
     */
    selectMany<ToT> (selector: SelectorFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT> {
        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.selectMany' to be a function.");

        return new Series(() => ({
            pairs: new SelectManyIterable(
                this.getContent().pairs, 
                (pair: [IndexT, ValueT], index: number): Iterable<[IndexT, ToT]> => {
                    const outputPairs: [IndexT, ToT][] = [];
                    for (const transformed of selector(pair[1], index)) {
                        outputPairs.push([
                            pair[0],
                            transformed
                        ]);
                    }
                    return outputPairs;
                }
            )
        }));
    }

    /**
     * Segment a Series into 'windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
     * Use select or selectPairs to aggregate.
     *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    window (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.window' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new WindowIterable<IndexT, ValueT>(this.getContent().pairs, period)
        }));
    }

    /** 
     * Segment a Series into 'rolling windows'. Returns a new Series. Each value in the new Series contains a 'window' (or segment) of the original series.
    *
     * @param period - The number of values in the window.
     * 
     * @returns Returns a new series, each value of which is a 'window' (or segment) of the original series.
     */
    rollingWindow (period: number): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isNumber(period, "Expected 'period' parameter to 'Series.rollingWindow' to be a number.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new RollingWindowIterable<IndexT, ValueT>(this.getContent().pairs, period)
        }));
    }

    /**
     * Groups sequential values into variable length 'windows'.
     *
     * @param comparer - Predicate that compares two values and returns true if they should be in the same window.
     * 
     * @returns Returns a series of groups. Each group is itself a series that contains the values in the 'window'. 
     */
    variableWindow (comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>> {
        
        assert.isFunction(comparer, "Expected 'comparer' parameter to 'Series.variableWindow' to be a function.")

        return new Series<number, ISeries<IndexT, ValueT>>(() => ({
            values: new VariableWindowIterable<IndexT, ValueT>(this.getContent().pairs, comparer)
        }));
    };    

    /**
     * Group sequential duplicate values into a Series of windows.
     *
     * @param [selector] - Optional selector function to determine the value used to compare for duplicates.
     * 
     * @returns Returns a series of groups. Each group is itself a series. 
     */
    sequentialDistinct<ToT = ValueT> (selector?: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT> {
        
        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'Series.sequentialDistinct' to be a selector function that determines the value to compare for duplicates.")
        }
        else {
            selector = (value: ValueT): ToT => <ToT> <any> value;
        }

        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b))
            .asPairs()
            .select(function (pair) {
                var window = pair[1];
                return [window.getIndex().first(), window.first()];
            })
            .asValues() 
            ;
    }

    /**
     * Aggregate the values in the series.
     *
     * @param [seed] - Optional seed value for producing the aggregation.
     * @param selector - Function that takes the seed and then each value in the series and produces the aggregate value.
     * 
     * @returns Returns a new value that has been aggregated from the input sequence by the 'selector' function. 
     */
    aggregate<ToT = ValueT> (seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT {

        if (Sugar.Object.isFunction(seedOrSelector) && !selector) {
            return this.skip(1).aggregate(<ToT> <any> this.first(), seedOrSelector);
        }
        else {
            assert.isFunction(selector, "Expected 'selector' parameter to aggregate to be a function.");

            let accum = <ToT> seedOrSelector;

            for (const value of this) {
                accum = selector!(accum, value);                
            }

            return accum;
        }
    };
    
    /**
     * Compute the percent change between each pair of values.
     * Percentages are expressed as 0-1 values.
     * 
     * @returns Returns a new series where each value indicates the percent change from the previous number value in the original series.  
     */
    percentChange (): ISeries<IndexT, number> {

        return (<ISeries<IndexT, number>> <any> this) // Have to assume this is a number series.
            .rollingWindow(2)
            .asPairs()
            .select((pair: [number, ISeries<IndexT, number>]): [IndexT, number] => {
                var window = pair[1];
                var values = window.toArray();
                var amountChange = values[1] - values[0]; // Compute amount of change.
                var pctChange = amountChange / values[0]; // Compute % change.
                return [window.getIndex().last(), pctChange]; // Return new index and value.
            })
            .asValues<IndexT, number>() // Result is always a series.
            ;
    }    
    
    /**
     * Skip a number of values in the series.
     *
     * @param numValues - Number of values to skip.     * 
     * @returns Returns a new series or dataframe with the specified number of values skipped. 
     */
    skip (numValues: number): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => ({
            values: new SkipIterable(this.getContent().values, numValues),
            index: new SkipIterable(this.getContent().index, numValues),
            pairs: new SkipIterable(this.getContent().pairs, numValues),
        }));
    }
    
    /**
     * Skips values in the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that match the predicate.  
     */
    skipWhile (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.skipWhile' function to be a predicate function that returns true/false.");

        return new Series<IndexT, ValueT>(() => ({
            values: new SkipWhileIterable(this.getContent().values, predicate),
            pairs: new SkipWhileIterable(this.getContent().pairs, pair => predicate(pair[1])),
        }));
    }

    /**
     * Skips values in the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series with all initial sequential values removed that don't match the predicate.
     */
    skipUntil (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.skipUntil' function to be a predicate function that returns true/false.");

        return this.skipWhile(value => !predicate(value)); 
    }

    /**
     * Take a number of rows in the series.
     *
     * @param numRows - Number of rows to take.
     * 
     * @returns Returns a new series with up to the specified number of values included.
     */
    take (numRows: number): ISeries<IndexT, ValueT> {
        assert.isNumber(numRows, "Expected 'numRows' parameter to 'Series.take' function to be a number.");

        return new Series(() => ({
            index: new TakeIterable(this.getContent().index, numRows),
            values: new TakeIterable(this.getContent().values, numRows),
            pairs: new TakeIterable(this.getContent().pairs, numRows)
        }));
    };

    /**
     * Take values from the series while a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series that only includes the initial sequential values that have matched the predicate.
     */
    takeWhile (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.takeWhile' function to be a predicate function that returns true/false.");

        return new Series(() => ({
            values: new TakeWhileIterable(this.getContent().values, predicate),
            pairs: new TakeWhileIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

    /**
     * Take values from the series until a condition is met.
     *
     * @param predicate - Return true to indicate the condition met.
     * 
     * @returns Returns a new series or dataframe that only includes the initial sequential values that have not matched the predicate.
     */
    takeUntil (predicate: PredicateFn<ValueT>) {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.takeUntil' function to be a predicate function that returns true/false.");

        return this.takeWhile(value => !predicate(value));
    }

    /**
     * Count the number of values in the series.
     *
     * @returns Returns the count of all values in the series.
     */
    count (): number {

        var total = 0;
        for (const value of this.getContent().values) {
            ++total;
        }
        return total;
    }

    /**
     * Get the first value of the series.
     *
     * @returns Returns the first value of the series.
     */
    first (): ValueT {

        for (const value of this) {
            return value; // Only need the first value.
        }

        throw new Error("No values in Series.");
    }

    /**
     * Get the last value of the series.
     *
     * @returns Returns the last value of the series.
     */
    last (): ValueT {

        let lastValue = null;

        for (const value of this) {
            lastValue = value; // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error("No values in Series.");
        }

        return lastValue;
    }    
    
    /**
     * Get the value at a specified index.
     *
     * @param index - Index to for which to retreive the value.
     *
     * @returns Returns the value from the specified index in the sequence or undefined if there is no such index in the series.
     */
    at (index: IndexT): ValueT | undefined {

        if (this.none()) {
            return undefined;
        }

        //
        // This is pretty expensive.
        // A specialised index could improve this.
        //

        for (const pair of this.getContent().pairs) {
            if (pair[0] === index) {
                return pair[1];
            }
        }

        return undefined;
    }
    
    /** 
     * Get X values from the start of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the start of the input sequence.  
     */
    head (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'Series.head' function to be a number.");

        return this.take(numValues);
    }

    /** 
     * Get X values from the end of the series.
     *
     * @param numValues - Number of values to take.
     * 
     * @returns Returns a new series that has only the specified number of values taken from the end of the input sequence.  
     */
    tail (numValues: number): ISeries<IndexT, ValueT> {

        assert.isNumber(numValues, "Expected 'values' parameter to 'Series.tail' function to be a number.");

        return this.skip(this.count() - numValues);
    }

    /**
     * Filter a series by a predicate selector.
     *
     * @param predicate - Predicte function to filter rows of the series.
     * 
     * @returns Returns a new series containing only the values that match the predicate. 
     */
    where (predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT> {

        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.where' function to be a function.");

        return new Series(() => ({
            values: new WhereIterable(this.getContent().values, predicate),
            pairs: new WhereIterable(this.getContent().pairs, pair => predicate(pair[1]))
        }));
    }

    /**
     * Invoke a callback function for each value in the series.
     *
     * @param callback - The calback to invoke for each value.
     * 
     * @returns Returns the input series with no modifications.
     */
    forEach (callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT> {
        assert.isFunction(callback, "Expected 'callback' parameter to 'Series.forEach' to be a function.");

        let index = 0;
        for (const value of this) {
            callback(value, index++);
        }

        return this;
    };

    /**
     * Determine if the predicate returns truthy for all values in the series.
     * Returns false as soon as the predicate evaluates to falsy.
     * Returns true if the predicate returns truthy for all values in the series.
     * Returns false if the series is empty.
     *
     * @param predicate - Predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns {boolean} Returns true if the predicate has returned truthy for every value in the sequence, otherwise returns false. 
     */
    all (predicate: PredicateFn<ValueT>): boolean {
        assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.all' to be a function.")

        var count = 0;

        for (const value of this) {
            if (!predicate(value)) {
                return false;
            }

            ++count;
        }

        return count > 0;
    }

    /**
     * Determine if the predicate returns truthy for any of the values in the series.
     * Returns true as soon as the predicate returns truthy.
     * Returns false if the predicate never returns truthy.
     * If no predicate is specified the value itself is checked. 
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     *
     * @returns Returns true if the predicate has returned truthy for any value in the sequence, otherwise returns false. 
     */
    any (predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.any' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return true;
                }
            }
        }
        else {
            // Check each value directly.
            for (const value of this) {
                if (value) {
                    return true;
                }
            }
        }

        return false; // Nothing passed.
    }

    /**
     * Determine if the predicate returns truthy for none of the values in the series.
     * Returns true for an empty series.
     * Returns true if the predicate always returns falsy.
     * Otherwise returns false.
     * If no predicate is specified the value itself is checked.
     *
     * @param [predicate] - Optional predicate function that receives each value in turn and returns truthy for a match, otherwise falsy.
     * 
     * @returns Returns true if the predicate has returned truthy for no values in the series, otherwise returns false. 
     */
    none (predicate?: PredicateFn<ValueT>): boolean {

        if (predicate) {
            assert.isFunction(predicate, "Expected 'predicate' parameter to 'Series.none' to be a function.")
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return false;
                }
            }
        }
        else {
            // Check each value directly.
            for (const value of this) {
                if (value) {
                    return false;
                }
            }
        }

        return true; // Nothing failed the predicate.
    }

    /**
     * Get a new series containing all values starting at and after the specified index value.
     * 
     * @param indexValue - The index value to search for before starting the new series.
     * 
     * @returns Returns a new series containing all values starting at and after the specified index value. 
     */
    startAt (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            var lessThan = this.getIndex().getLessThan();
            return {                
                index: new SkipWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
            }
        });
    }

    /**
     * Get a new series containing all values up until and including the specified index value (inclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up until and including the specified index value. 
     */
    endAt (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            var lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values up to the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for before ending the new series.
     * 
     * @returns Returns a new series containing all values up to the specified inde value. 
     */
    before (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            var lessThan = this.getIndex().getLessThan();
            return {
                index: new TakeWhileIterable(this.getContent().index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(this.getContent().pairs, pair => lessThan(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values after the specified index value (exclusive).
     * 
     * @param indexValue - The index value to search for.
     * 
     * @returns Returns a new series containing all values after the specified index value.
     */
    after (indexValue: IndexT): ISeries<IndexT, ValueT> {
        return new Series<IndexT, ValueT>(() => {
            var lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo();
            return {
                index: new SkipWhileIterable(this.getContent().index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(this.getContent().pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            };
        });
    }

    /**
     * Get a new series containing all values between the specified index values (inclusive).
     * 
     * @param startIndexValue - The index where the new sequence starts. 
     * @param endIndexValue - The index where the new sequence ends.
     * 
     * @returns Returns a new series containing all values between the specified index values (inclusive).
     */
    between (startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue); 
    }

    /** 
     * Format the series for display as a string.
     * This forces lazy evaluation to complete.
     * 
     * @returns Generates and returns a string representation of the series or dataframe.
     */
    toString (): string {

        var header = ["__index__", "__value__"];
        var rows = this.toPairs();

        var table = new Table();
        rows.forEach(function (row, rowIndex) {
            row.forEach(function (cell, cellIndex) {
                table.cell(header[cellIndex], cell);
            });
            table.newRow();
        });

        return table.toString();
    };

    //
    // Helper function to parse a string to an int.
    //
    static parseInt (value: any | undefined, valueIndex: number): number | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseInts, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return parseInt(value);
        }
    }

    /**
     * Parse a series with string values to a series with int values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to integer values.
     */
    parseInts (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseInt);
    };

    //
    // Helper function to parse a string to a float.
    //
    static parseFloat (value: any | undefined, valueIndex: number): number | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseFloats, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return parseFloat(value);
        }
    }

    /**
     * Parse a series with string values to a series with float values.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to floating-point values.
     */
    parseFloats (): ISeries<IndexT, number> {
        return <ISeries<IndexT, number>> this.select(Series.parseFloat);
    };

    //
    // Helper function to parse a string to a date.
    //
    static parseDate (value: any | undefined, valueIndex: number, formatString?: string): Date | undefined {
        if (value === undefined) {
            return undefined;
        }
        else {
            assert.isString(value, "Called Series.parseDates, expected all values in the series to be strings, instead found a '" + typeof(value) + "' at index " + valueIndex);

            if (value.length === 0) {
                return undefined;
            }

            return moment(value, formatString).toDate();
        }
    }

    /**
     * Parse a series with string values to a series with date values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * @returns Returns a new series where string values from the original series have been parsed to Date values.
     */
    parseDates (formatString?: string): ISeries<IndexT, Date> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to Series.parseDates to be a string (if specified).");
        }

        return <ISeries<IndexT, Date>> this.select((value: any | undefined, valueIndex: number) => Series.parseDate(value, valueIndex, formatString));
    };

    //
    // Helper function to convert a value to a string.
    //
    static toString(value: any | undefined, formatString?: string): string | undefined | null {
        if (value === undefined) {
            return undefined;
        }
        else if (value === null) {
            return null;
        }
        else if (formatString && Sugar.Object.isDate(value)) {
            return moment(value).format(formatString);
        }
        else if (formatString && moment.isMoment(value)) {
            return value.format(formatString);
        }
        else {
            return value.toString();	
        }		
    }

    /**
     * Convert a series of values of different types to a series of string values.
     *
     * @param [formatString] Optional formatting string for dates.
     * 
     * @returns Returns a new series where the values from the original series have been stringified. 
     */
    toStrings (formatString?: string): ISeries<IndexT, string> {

        if (formatString) {
            assert.isString(formatString, "Expected optional 'formatString' parameter to Series.toStrings to be a string (if specified).");
        }

        return <ISeries<IndexT, string>> this.select(value => Series.toString(value, formatString));
    };    

    /**
     * Forces lazy evaluation to complete and 'bakes' the series into memory.
     * 
     * @returns Returns a series that has been 'baked', all lazy evaluation has completed.  
     */
    bake (): ISeries<IndexT, ValueT> {

        if (this.getContent().isBaked) {
            // Already baked.
            return this;
        }

        return new Series<IndexT, ValueT>({
            pairs: this.toPairs(),
            baked: true,
        });
    };

    /** 
     * Inflate the series to a dataframe.
     *
     * @param [selector] Optional selector function that transforms each value in the series to a row in the new dataframe.
     *
     * @returns Returns a new dataframe that has been created from the input series via the 'selector' function.
     */
    inflate<ToT = any> (selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to Series.inflate to be a selector function.");

            return new DataFrame<IndexT, ToT>({ //TODO: Pass a fn in here.
                values: new SelectIterable(this.getContent().values, selector),
                index: this.getContent().index,
                pairs: new SelectIterable(this.getContent().pairs, (pair: [IndexT, ValueT], index: number): [IndexT, ToT] => [pair[0], selector(pair[1], index)]),
            });            
        }
        else {
            return new DataFrame<IndexT, ToT>({ //TODO: Pass a fn in here.
                values: <Iterable<ToT>> <any> this.getContent().values,
                index: this.getContent().index,
                pairs: <Iterable<[IndexT, ToT]>> <any> this.getContent().pairs
            });
        }
    }

    /**
     * Sum the values in a series.
     * 
     * @returns Returns the sum of the number values in the series.
     */
    sum (): number {

        if (this.none()) {
            return 0;
        }

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev: number, value: number) => prev + value);
    }

    /**
     * Average the values in a series.
     * 
     * @returns Returns the average of the number values in the series.
     */
    average (): number {

        const count = this.count();
        if (count > 0) {
            return this.sum() / count;
        }
        else {
            return 0;
        }
    }

    /**
     * Get the median value in the series. Not this sorts the series, so can be expensive.
     * 
     * @returns Returns the median of the values in the series.
     */
    median (): number {

        //
        // From here: http://stackoverflow.com/questions/5275115/add-a-median-method-to-a-list
        //
        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.

        const count = numberSeries.count();
        if (count === 0) {
            return 0;
        }

        const ordered = numberSeries.orderBy(value => value).toArray();
        if ((count % 2) == 0) {
            // Even.
            var a = ordered[count / 2 - 1];
            var b = ordered[count / 2];
            return (a + b) / 2;	
        }

        // Odd
        return ordered[Math.floor(count / 2)];
    }

    /**
     * Get the min value in the series.
     * 
     * @returns Returns the minimum of the number values in the series.
     */
    min (): number {

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev, value) => Math.min(prev, value));
    }

    /**
     * Get the max value in the series.
     * 
     * @returns Returns the maximum of the number values in the series.
     */
    max (): number {

        const numberSeries = <ISeries<IndexT, number>> <any> this; // Have to assume we are working with a number series here.
        return numberSeries.aggregate((prev, value) => Math.max(prev, value));
    }
    
    /** 
     * Reverse the series.
     * 
     * @returns Returns a new series that is the reverse of the input.
     */
    reverse (): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new ReverseIterable(this.getContent().values),
            index: new ReverseIterable(this.getContent().index),
            pairs: new ReverseIterable(this.getContent().pairs)
        }));
    }

    /**
     * Returns only values in the series that have distinct values.
     *
     * @param selector - Selects the value used to compare for duplicates.
     * 
     * @returns Returns a series containing only unique values as determined by the 'selector' function. 
     */
    distinct<ToT> (selector?: SelectorFnNoIndex<ValueT, ToT>): ISeries<IndexT, ValueT> {

        return new Series<IndexT, ValueT>(() => ({
            values: new DistinctIterable<ValueT, ToT>(this.getContent().values, selector),
            pairs: new DistinctIterable<[IndexT, ValueT],ToT>(this.getContent().pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
        }));
    }

    /**
     * Group the series according to the selector.
     *
     * @param selector - Selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupBy<GroupT> (selector: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        assert.isFunction(selector, "Expected 'selector' parameter to 'Series.groupBy' to be a selector function that determines the value to group the series by.");

        return new Series<number, ISeries<IndexT, ValueT>>(() => {
            const groups: any[] = []; // Each group, in order of discovery.
            const groupMap: any = {}; // Group map, records groups by key.
            
            let valueIndex = 0;
    
            for (const pair of this.getContent().pairs) {
                const groupKey = selector(pair[1], valueIndex);
                ++valueIndex;
                const existingGroup = groupMap[groupKey];
                if (existingGroup) {
                    existingGroup.push(pair);
                }
                else {
                    const newGroup: any[] = [];
                    newGroup.push(pair);
                    groups.push(newGroup);
                    groupMap[groupKey] = newGroup;
                }
            }

            return {
                values: groups.map(group => new Series<IndexT, ValueT>({ pairs: group }))
            };            
        });
    }
    
    /**
     * Group sequential values into a Series of windows.
     *
     * @param selector - Optional selector that defines the value to group by.
     *
     * @returns Returns a series of groups. Each group is a series with values that have been grouped by the 'selector' function.
     */
    groupSequentialBy<GroupT> (selector?: SelectorFnNoIndex<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> {

        if (selector) {
            assert.isFunction(selector, "Expected 'selector' parameter to 'Series.groupSequentialBy' to be a selector function that determines the value to group the series by.")
        }
        else {
            selector = value => <GroupT> <any> value;
        }
        
        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b));
    }

    /**
     * Concatenate multiple series into a single series.
     *
     * @param series - Array of series to concatenate.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */
    static concat<IndexT = any, ValueT = any> (series: ISeries<IndexT, ValueT>[]): ISeries<IndexT, ValueT> {
        assert.isArray(series, "Expected 'series' parameter to 'Series.concat' to be an array of series.");

        return new Series(() => {
            const upcast = <Series<IndexT, ValueT>[]> series; // Upcast so that we can access private index, values and pairs.
            return {
                index: new ConcatIterable(upcast.map(s => s.getContent().index)),
                values: new ConcatIterable(upcast.map(s => s.getContent().values)),
                pairs: new ConcatIterable(upcast.map(s => s.getContent().pairs)),
            };
        });
    }
    
    /**
     * Concatenate multiple other series onto this series.
     * 
     * @param series - Multiple arguments. Each can be either a series or an array of series.
     * 
     * @returns Returns a single series concatenated from multiple input series. 
     */    
    concat (...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT> {
        const concatInput: ISeries<IndexT, ValueT>[] = [this];

        for (const input of series) {
            if (Sugar.Object.isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput);
                }
            }
            else {
                concatInput.push(input);
            }
        }

        return Series.concat<IndexT, ValueT>(concatInput);
    }
   
    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    *
    * @param series - Multiple arguments. Each can be either a series or an array of series.
    * @param zipper - Selector function that produces a new series based on the input series.
    * 
    * @returns Returns a single series zipped from multiple input series. 
    */
    static zip<IndexT = any, ValueT = any, ResultT = any> (series: ISeries<IndexT, ValueT>[], zipper: ZipNFn<ValueT, ResultT>): ISeries<IndexT, ResultT> {

        assert.isArray(series, "Expected 'series' parameter to 'Series.zip' to be an array of series.");

        if (series.length === 0) {
            return new Series<IndexT, ResultT>();
        }

        const firstSeries = series[0];
        if (firstSeries.none()) {
            return new Series<IndexT, ResultT>();
        }

        return new Series<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <Series<IndexT, ValueT>> firstSeries;
            const upcast = <Series<IndexT, ValueT>[]> series; // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            };
        });
    }
    
    /**
    * Zip together multiple series to create a new series.
    * Preserves the index of the first series.
    * 
    * @param s2, s3, s4, s4 - Multiple series to zip.
    * @param zipper - Zipper function that produces a new series based on the input series.
    * 
    * @returns Returns a single series concatenated from multiple input series. 
    */    
    zip<Index2T, Value2T, ResultT>  (s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>  (s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>;
    zip<ResultT>  (...args: any[]): ISeries<IndexT, ResultT> {

        const selector: Function = args[args.length-1];
        const input: ISeries<IndexT, any>[] = [this].concat(args.slice(0, args.length-1));
        return Series.zip<IndexT, any, ResultT>(input, values => selector(...values));
    }    

    /**
     * Sorts the series by a value defined by the selector (ascending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Ascending, null);
    }

    /**
     * Sorts the series by a value defined by the selector (descending). 
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new ordered series that has been sorted by the value returned by the selector. 
     */
    orderByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.getContent().values, this.getContent().pairs, selector, Direction.Descending, null);
    }
        
    /**
     * Returns the unique union of values between two series.
     *
     * @param other - The other Series or DataFrame to combine.
     * @param [selector] - Optional function that selects the value to compare to detemrine distinctness.
     * 
     * @returns Returns the union of two series.
     */
    union<KeyT = ValueT> (
        other: ISeries<IndexT, ValueT>, 
        selector?: JoinSelectorFn<ValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (selector) {
            assert.isFunction(selector, "Expected optional 'selector' parameter to 'Series.union' to be a selector function.");
        }

        return this.concat(other).distinct(selector);
    };

    /**
     * Returns the intersection of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the intersection of two series.
     */
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: JoinSelectorFn<ValueT, KeyT>,
        innerSelector?: JoinSelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'Series.intersection' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }
        
        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'Series.intersection' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .any();
            });
    };

    /**
     * Returns the exception of values between two series.
     *
     * @param inner - The other series to combine.
     * @param [outerSelector] - Optional function to select the key for matching the two series.
     * @param [innerSelector] - Optional function to select the key for matching the two series.
     * 
     * @returns Returns the difference between the two series.
     */
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerSelector?: JoinSelectorFn<ValueT, KeyT>,
        innerSelector?: JoinSelectorFn<InnerValueT, KeyT>): 
            ISeries<IndexT, ValueT> {

        if (outerSelector) {
            assert.isFunction(outerSelector, "Expected optional 'outerSelector' parameter to 'Series.except' to be a function.");
        }
        else {
            outerSelector = value => <KeyT> <any> value;
        }

        if (innerSelector) {
            assert.isFunction(innerSelector, "Expected optional 'innerSelector' parameter to 'Series.except' to be a function.");
        }
        else {
            innerSelector = value => <KeyT> <any> value;
        }

        const outer = this;
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue);
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .none();
            });
    };

   /**
     * Correlates the elements of two series on matching keys.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * @returns Returns the joined series. 
     */
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.join' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.join' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.join' to be a selector function.");

        const outer = this;

        return new Series<number, ResultValueT>(() => {
            const innerMap = inner
                .groupBy(innerKeySelector)
                .toObject(
                    group => innerKeySelector(group.first()), 
                    group => group
                );

            const outerContent = outer.getContent();

            const output: ResultValueT[] = [];
            
            for (const outerValue of outer) { //TODO: There should be an enumerator that does this.
                const outerKey = outerKeySelector(outerValue);
                const innerGroup = innerMap[outerKey];
                if (innerGroup) {
                    for (const innerValue of innerGroup) {
                        output.push(resultSelector(outerValue, innerValue));
                    }    
                }
            }

            return {
                values: output
            };
        });
    }

    /**
     * Performs an outer join on two series. Correlates the elements based on matching keys.
     * Includes elements from both series that have no correlation in the other series.
     *
     * @param this - The outer series to join. 
     * @param inner - The inner series to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns Returns the joined series. 
     */
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuter' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuter' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the results in the inner that are not in the outer.
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .concat(innerResult)
            .resetIndex();
    };

    /**
     * Performs a left outer join on two series. Correlates the elements based on matching keys.
     * Includes left elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuterLeft' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuterLeft' to be a selector function.");

        // Get the results in the outer that are not in the inner.
        const outer = this;
        const outerResult = outer.except<InnerIndexT, InnerValueT, KeyT>(inner, outerKeySelector, innerKeySelector)
            .select(outer => resultSelector(outer, null))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return outerResult
            .concat(intersectionResults)
            .resetIndex();
    };

    /**
     * Performs a right outer join on two series. Correlates the elements based on matching keys.
     * Includes right elements that have no correlation.
     *
     * @param this - The outer Series or DataFrame to join. 
     * @param inner - The inner Series or DataFrame to join.
     * @param outerKeySelector - Selector that chooses the join key from the outer sequence.
     * @param innerKeySelector - Selector that chooses the join key from the inner sequence.
     * @param resultSelector - Selector that defines how to merge outer and inner values.
     * 
     * Implementation from here:
     * 
     * 	http://blogs.geniuscode.net/RyanDHatch/?p=116
     * 
     * @returns {Series|DataFrame} Returns the joined series or dataframe. 
     */
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: ISeries<InnerIndexT, InnerValueT>, 
        outerKeySelector: JoinSelectorFn<ValueT, KeyT>, 
        innerKeySelector: JoinSelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>):
            ISeries<number, ResultValueT> {

        assert.isFunction(outerKeySelector, "Expected 'outerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        assert.isFunction(innerKeySelector, "Expected 'innerKeySelector' parameter of 'Series.joinOuterRight' to be a selector function.");
        assert.isFunction(resultSelector, "Expected 'resultSelector' parameter of 'Series.joinOuterRight' to be a selector function.");

        // Get the results in the inner that are not in the outer.
        const outer = this;
        const innerResult = inner.except<IndexT, ValueT, KeyT>(outer, innerKeySelector, outerKeySelector)
            .select(inner => resultSelector(null, inner))
            .resetIndex();

        // Get the intersection of results between inner and outer.
        const intersectionResults = outer.join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner, outerKeySelector, innerKeySelector, resultSelector);

        return intersectionResults
            .concat(innerResult)
            .resetIndex();
    }    

    /**
     * Produces a new series with all string values truncated to the requested maximum length.
     *
     * @param maxLength - The maximum length of the string values after truncation.
     * 
     * @returns Returns a new series with strings that are truncated to the specified maximum length. 
     */
    truncateStrings (maxLength: number): ISeries<IndexT, ValueT> {

        assert.isNumber(maxLength, "Expected 'maxLength' parameter to 'Series.truncateStrings' to be a number.");

        return this.select((value: any) => {
                if (Sugar.Object.isString(value)) {
                    if (value.length > maxLength) {
                        return value.substring(0, maxLength);
                    }
                }

                return value;
            });
    };    
}

//
// A series that has been ordered.
//
class OrderedSeries<IndexT = number, ValueT = any, SortT = any> 
    extends Series<IndexT, ValueT>
    implements IOrderedSeries<IndexT, ValueT, SortT> {

    parent: OrderedSeries<IndexT, ValueT, SortT> | null;
    selector: SelectorFn<ValueT, SortT>;
    direction: Direction;
    origValues: Iterable<ValueT>;
    origPairs: Iterable<[IndexT, ValueT]>;

    //
    // Helper function to create a sort spec.
    //
    private static makeSortSpec (sortLevel: number, selector: SortSelectorFn, direction: Direction): ISortSpec {
        return { sortLevel: sortLevel, selector: selector, direction: direction };
    }

    //
    // Helper function to make a sort selector for pairs, this captures the parent correct when generating the closure.
    //
    private static makePairsSelector (selector: SortSelectorFn): SortSelectorFn {
        return (pair: any, index: number) => selector(pair[1], index);
    }

    constructor(values: Iterable<ValueT>, pairs: Iterable<[IndexT, ValueT]>, selector: SelectorFn<ValueT, SortT>, direction: Direction, parent: OrderedSeries<IndexT, ValueT> | null) {

        const valueSortSpecs: ISortSpec[] = [];
        const pairSortSpecs: ISortSpec[] = [];
        let sortLevel = 0;

        while (parent !== null) {
            valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, parent.selector, parent.direction));
            pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, OrderedSeries.makePairsSelector(parent.selector), parent.direction));
            ++sortLevel;
            parent = parent.parent;
        }

        valueSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, selector, direction));
        pairSortSpecs.push(OrderedSeries.makeSortSpec(sortLevel, (pair: [IndexT, ValueT], index: number) => selector(pair[1], index), direction));

        super({
            values: new OrderedIterable(values, valueSortSpecs),
            pairs: new OrderedIterable(pairs, pairSortSpecs)
        });

        this.parent = parent;
        this.selector = selector;
        this.direction = direction;
        this.origValues = values;
        this.origPairs = pairs;
    }

    /** 
     * Performs additional sorting (ascending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenBy<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Ascending, this);
    }

    /** 
     * Performs additional sorting (descending).
     * 
     * @param selector Selects the value to sort by.
     * 
     * @returns Returns a new series has been additionally sorted by the value returned by the selector. 
     */
    thenByDescending<SortT> (selector: SelectorFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT> {
        //TODO: Should pass a config fn to OrderedSeries.
        return new OrderedSeries<IndexT, ValueT, SortT>(this.origValues, this.origPairs, selector, Direction.Descending, this);        
    }
}
    