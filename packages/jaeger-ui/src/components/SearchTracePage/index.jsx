// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* eslint-disable react/require-default-props */

import React, { Component } from 'react';
import { Col, Row, Tabs } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';
import memoizeOne from 'memoize-one';

import SearchForm from './SearchForm';
import SearchResults, { sortFormSelector } from './SearchResults';
import { isSameQuery, getUrl, getUrlState } from './url';
import * as jaegerApiActions from '../../actions/jaeger-api';
import * as fileReaderActions from '../../actions/file-reader-api';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIndicator from '../common/LoadingIndicator';
import { getLocation as getTraceLocation } from '../TracePage/url';
import { actions as traceDiffActions } from '../TraceDiff/duck';
import { fetchedState } from '../../constants';
import { sortTraces } from '../../model/search';
import { stripEmbeddedState } from '../../utils/embedded-url';
import FileLoader from './FileLoader';

import './index.css';
import JaegerLogo from '../../img/jaeger-logo.svg';
import withRouteProps from '../../utils/withRouteProps';

// export for tests
export class SearchTracePageImpl extends Component {
  componentDidMount() {
    const {
      diffCohort,
      fetchMultipleTraces,
      fetchServiceOperations,
      fetchServices,
      isHomepage,
      queryOfResults,
      searchTraces,
      urlQueryParams,
    } = this.props;
    if (!isHomepage && urlQueryParams && !isSameQuery(urlQueryParams, queryOfResults)) {
      searchTraces(urlQueryParams);
    }
    const needForDiffs = diffCohort.filter(ft => ft.state == null).map(ft => ft.id);
    if (needForDiffs.length) {
      fetchMultipleTraces(needForDiffs);
    }
    fetchServices();
    let { service } = store.get('lastSearch') || {};
    if (urlQueryParams && urlQueryParams.service) {
      service = urlQueryParams.service;
    }
    if (service && service !== '-') {
      fetchServiceOperations(service);
    }
  }

  goToTrace = traceID => {
    const { queryOfResults } = this.props;
    const searchUrl = queryOfResults ? getUrl(stripEmbeddedState(queryOfResults)) : getUrl();
    this.props.history.push(getTraceLocation(traceID, { fromSearch: searchUrl }));
  };

  render() {
    const {
      cohortAddTrace,
      cohortRemoveTrace,
      diffCohort,
      embedded,
      errors,
      isHomepage,
      disableFileUploadControl,
      loadingServices,
      loadingTraces,
      maxTraceDuration,
      services,
      traceResults,
      traceResultsToDownload,
      queryOfResults,
      loadJsonTraces,
      urlQueryParams,
    } = this.props;
    const hasTraceResults = traceResults && traceResults.length > 0;
    const showErrors = errors && !loadingTraces;
    const showLogo = isHomepage && !hasTraceResults && !loadingTraces && !errors;
    const tabItems = [];
    if (!loadingServices && services) {
      tabItems.push({ label: 'Search', key: 'searchForm', children: <SearchForm services={services} /> });
    } else {
      tabItems.push({ label: 'Search', key: 'searchForm', children: <LoadingIndicator /> });
    }
    if (!disableFileUploadControl) {
      tabItems.push({
        label: 'Upload',
        key: 'fileLoader',
        children: <FileLoader loadJsonTraces={loadJsonTraces} />,
      });
    }
    return (
      <Row className="SearchTracePage--row">
        {!embedded && (
          <Col span={6} className="SearchTracePage--column">
            <div className="SearchTracePage--find">
              <Tabs size="large" items={tabItems} />
            </div>
          </Col>
        )}
        <Col span={!embedded ? 18 : 24} className="SearchTracePage--column">
          {showErrors && (
            <div className="js-test-error-message">
              <h2>There was an error querying for traces:</h2>
              {errors.map(err => (
                <ErrorMessage key={err.message} error={err} />
              ))}
            </div>
          )}
          {!showErrors && (
            <SearchResults
              cohortAddTrace={cohortAddTrace}
              cohortRemoveTrace={cohortRemoveTrace}
              diffCohort={diffCohort}
              disableComparisons={embedded}
              goToTrace={this.goToTrace}
              hideGraph={embedded && embedded.searchHideGraph}
              loading={loadingTraces}
              maxTraceDuration={maxTraceDuration}
              queryOfResults={queryOfResults}
              showStandaloneLink={Boolean(embedded)}
              skipMessage={isHomepage}
              spanLinks={urlQueryParams && urlQueryParams.spanLinks}
              traces={traceResults}
              rawTraces={traceResultsToDownload}
            />
          )}
          {showLogo && (
            <svg
              className="SearchTracePage--logo js-test-logo"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="200px"
              height="200px"
              viewBox="0 0 32 32"
              version="1.1"
            >
              <desc>Created with Sketch.</desc>
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="svg">
                  <rect x="0" y="0" width="32" height="32" />
                  <g transform="translate(0.000000, 4.000000)" fill="#246BF2" fill-rule="nonzero">
                    <path d="M24.4993318,17.507 L24.4993318,17.507 C24.5011137,17.5025034 24.5011137,17.4974966 24.4993318,17.493 L24.4993318,17.507 Z" />
                    <path d="M13.3475,7.603 C13.4231025,7.54233404 13.5029758,7.48719142 13.5865,7.438 L13.6525,7.397 L13.5865,7.434 C13.5019639,7.48311034 13.4219799,7.53966807 13.3475,7.603 L13.3475,7.603 Z" />
                    <path d="M24.5,17.5026797 L24.5,17.5026797 C24.5,17.5026797 24.5,17.4956797 24.5,17.4976797 L24.5,17.5026797 Z" />
                    <path d="M23.9867016,17.5995113 C23.9987591,17.7318003 24.0025067,17.8661636 23.9978718,18 C24.0027431,17.8671181 23.9992451,17.7336562 23.9874463,17.6022264 C23.9747422,17.4457635 23.9496584,17.2934863 23.9129783,17.1501493 L23,13 L23.9114889,17.1515069 C23.9481823,17.2935165 23.9735112,17.4443879 23.9867016,17.5995113 L23.9867016,17.5995113 Z" />
                    <polygon points="9.97571429 0 8 5 10 0" />
                    <path d="M15,7 L18,13 L15,7 Z" />
                    <path d="M17.5649574,13 L20.6625804,11.0699894 C21.0164165,10.8391719 21.4246927,10.7288222 21.8357004,10.7529162 C21.8859321,10.6506716 21.9403498,10.5518735 22,10.4542241 L17.9584392,0 L17.4613545,0 L15,6.36443973 L17.5649574,13 Z" />
                    <path d="M23.9391754,17.0310811 L23.9391754,17.0310811 C23.8963787,17.0216216 23.8524847,17.0121622 23.809688,17 L23.809688,17 L23.809688,17 C23.5934143,17.391136 23.2990237,17.7071302 22.9548519,17.9175676 C22.7870958,18.0196867 22.6093108,18.0946338 22.4259288,18.1405405 L19,19.1891892 L20.3168208,23 L26,23 L23.9424675,17.0310811 L23.9391754,17.0310811 Z" />
                    <path d="M24.6075142,17.8786517 C24.752735,17.8160334 24.8852353,17.7341041 25,17.6359647 C22.4531122,16.6820531 21.1547827,14.2568725 21.9827652,12 C21.819777,12.0270056 21.6631394,12.0766237 21.5191413,12.1468621 L17.7905258,13.9435798 L8.86883224,18.2432032 C8.1399691,18.61173 7.81904543,19.3661003 8.10225835,20.0451287 L8.12188264,20.0878332 C8.43392461,20.7083633 9.19495095,21.0760193 9.98251079,20.9867128 C10.027892,20.9867128 10.0744997,20.9762971 10.1198808,20.9679645 L20.2349767,18.8327348 L24.2309731,17.9890587 C24.3610697,17.9646783 24.487419,17.9276309 24.6075142,17.8786517 L24.6075142,17.8786517 Z" />
                    <path d="M22.445,12.273 C22.5355133,12.352409 22.6134062,12.4451386 22.676,12.548 C22.7118829,12.6076767 22.7420182,12.6706259 22.766,12.736 L22.843,12.928 L22.766,12.735 C22.7420517,12.6696118 22.711915,12.6066595 22.676,12.547 C22.6134189,12.4441295 22.5355245,12.351398 22.445,12.272 C22.3589749,12.1920073 22.2620025,12.1246653 22.157,12.072 L22.157,12.072 C22.261974,12.1251241 22.3589292,12.1927908 22.445,12.273 L22.445,12.273 Z" />
                    <path d="M31.9798015,10.5461075 L31.8687964,9 L30.9740955,10.2638815 C30.7751671,10.5467695 30.4986231,10.7653734 30.1781892,10.8930335 C29.6484754,11.1080064 29.0488267,11.0587891 28.5608453,10.7602869 C28.51212,10.7121061 28.4567994,10.6711625 28.3965578,10.6386955 C27.2607455,9.81196878 25.7836741,9.62479566 24.4791889,10.1422901 L24.4680884,10.1478677 C23.7054832,10.4756651 23.0614739,11.030948 22.6231841,11.7385959 C22.5194781,11.9058002 22.4278485,12.0802692 22.3490016,12.2606582 C22.3090398,12.3521307 22.2746282,12.4436031 22.2379965,12.5350756 C22.3545315,12.5938637 22.4621705,12.6689812 22.5576911,12.7581791 C22.6581903,12.8467368 22.7446588,12.9501824 22.8141128,13.0649465 C22.8539447,13.1315169 22.8873963,13.2017379 22.9140174,13.2746638 L22.9994913,13.4899587 L24.3604135,16.9000963 C24.4149156,17.0175515 24.4523011,17.1422824 24.4714185,17.2704482 C24.4888528,17.378459 24.4940662,17.4881057 24.4869592,17.5972949 C24.4937344,17.487322 24.4881489,17.3769322 24.4703085,17.2682171 C24.4509842,17.140814 24.413603,17.0168486 24.3593034,16.9000963 L23.0006014,13.4888432 L22.9151274,13.2746638 C22.8885064,13.2017379 22.8550547,13.1315169 22.8152229,13.0649465 C22.7457688,12.9501824 22.6593004,12.8467368 22.5588012,12.7581791 C22.4632336,12.6690398 22.3556033,12.5939284 22.2391066,12.5350756 L22.2391066,12.5350756 L22.2391066,12.5350756 C21.5126786,14.5706611 22.4936095,16.8221533 24.4747487,17.666457 C24.5369115,17.6921139 24.5990744,17.7188863 24.6623472,17.7423122 C24.8770387,17.821992 25.0979628,17.8835584 25.3228274,17.9263726 L25.3228274,17.9263726 C25.5756823,17.9747758 25.8324715,17.9994235 26.0898724,18 C26.5684255,18.0002491 27.0430605,17.9133207 27.4907564,17.7434277 C30.3944398,16.5915447 32.2139033,13.674385 31.9798015,10.5461075 L31.9798015,10.5461075 Z" />
                    <path d="M21.6405,12.6475 L21.5165,12.3525 C21.4625,12.4375 21.4085,12.5235 21.3595,12.6125 C21.453876,12.6175128 21.5477779,12.6292087 21.6405,12.6475 Z" />
                    <path d="M8.88394288,17.511621 L8.88394288,17.511621 L8.7972461,17.5580559 C7.96025682,18.0182711 7.44730368,18.8451493 7.44477634,19.7382312 C7.4471321,18.8445173 7.96064297,18.0170678 8.79848463,17.5569234 L8.88394288,17.5104885 L11.0748944,12.7911168 L11.107096,12.6925842 L17,0 L10.6178785,0 L8.88394288,3.68987591 L0,22.8301162 L0.453300306,23 L6.33505756,23 L7.53890427,20.4064408 L8.88270436,17.5104885 L8.88394288,17.511621 Z" />
                    <path d="M7,20 C7.00175612,19.1978103 7.35817987,18.4550865 7.93975904,18.0417091 L8,18 L8,18 L7.94061962,18.0417091 C7.35858439,18.4546904 7.00176801,19.1975521 7,20 L7,20 Z" />
                  </g>
                </g>
              </g>
            </svg>
          )}
        </Col>
      </Row>
    );
  }
}
SearchTracePageImpl.propTypes = {
  isHomepage: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  traceResults: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  traceResultsToDownload: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  diffCohort: PropTypes.array,
  cohortAddTrace: PropTypes.func,
  cohortRemoveTrace: PropTypes.func,
  embedded: PropTypes.shape({
    searchHideGraph: PropTypes.bool,
  }),
  maxTraceDuration: PropTypes.number,
  loadingServices: PropTypes.bool,
  disableFileUploadControl: PropTypes.bool,
  loadingTraces: PropTypes.bool,
  urlQueryParams: PropTypes.shape({
    service: PropTypes.string,
    limit: PropTypes.string,
  }),
  queryOfResults: PropTypes.shape({
    service: PropTypes.string,
    limit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  services: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      operations: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  searchTraces: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  fetchMultipleTraces: PropTypes.func,
  fetchServiceOperations: PropTypes.func,
  fetchServices: PropTypes.func,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string,
    })
  ),
  loadJsonTraces: PropTypes.func,
};

const stateTraceXformer = memoizeOne(stateTrace => {
  const { traces: traceMap, rawTraces, search } = stateTrace;
  const { query, results, state, error: traceError } = search;

  const loadingTraces = state === fetchedState.LOADING;
  const traces = results.map(id => traceMap[id].data);
  const maxDuration = Math.max.apply(
    null,
    traces.map(tr => tr.duration)
  );
  return { traces, rawTraces, maxDuration, traceError, loadingTraces, query };
});

const stateTraceDiffXformer = memoizeOne((stateTrace, stateTraceDiff) => {
  const { traces } = stateTrace;
  const { cohort } = stateTraceDiff;
  return cohort.map(id => traces[id] || { id });
});

const sortedTracesXformer = memoizeOne((traces, sortBy) => {
  const traceResults = traces.slice();
  sortTraces(traceResults, sortBy);
  return traceResults;
});

const stateServicesXformer = memoizeOne(stateServices => {
  const {
    loading: loadingServices,
    services: serviceList,
    operationsForService: opsBySvc,
    error: serviceError,
  } = stateServices;
  const services =
    serviceList &&
    serviceList.map(name => ({
      name,
      operations: opsBySvc[name] || [],
    }));
  return { loadingServices, services, serviceError };
});

// export to test
export function mapStateToProps(state) {
  const { embedded, router, services: stServices, traceDiff, config } = state;
  const query = getUrlState(router.location.search);
  const isHomepage = !Object.keys(query).length;
  const { disableFileUploadControl } = config;
  const {
    query: queryOfResults,
    traces,
    rawTraces,
    maxDuration,
    traceError,
    loadingTraces,
  } = stateTraceXformer(state.trace);
  const diffCohort = stateTraceDiffXformer(state.trace, traceDiff);
  const { loadingServices, services, serviceError } = stateServicesXformer(stServices);
  const errors = [];
  if (traceError) {
    errors.push(traceError);
  }
  if (serviceError) {
    errors.push(serviceError);
  }
  const sortBy = sortFormSelector(state, 'sortBy');
  const traceResults = sortedTracesXformer(traces, sortBy);
  return {
    queryOfResults,
    diffCohort,
    embedded,
    isHomepage,
    loadingServices,
    disableFileUploadControl,
    loadingTraces,
    services,
    traceResults,
    traceResultsToDownload: rawTraces,
    errors: errors.length ? errors : null,
    maxTraceDuration: maxDuration,
    sortTracesBy: sortBy,
    urlQueryParams: Object.keys(query).length > 0 ? query : null,
  };
}

function mapDispatchToProps(dispatch) {
  const { fetchMultipleTraces, fetchServiceOperations, fetchServices, searchTraces } = bindActionCreators(
    jaegerApiActions,
    dispatch
  );
  const { loadJsonTraces } = bindActionCreators(fileReaderActions, dispatch);
  const { cohortAddTrace, cohortRemoveTrace } = bindActionCreators(traceDiffActions, dispatch);
  return {
    cohortAddTrace,
    cohortRemoveTrace,
    fetchMultipleTraces,
    fetchServiceOperations,
    fetchServices,
    searchTraces,
    loadJsonTraces,
  };
}

export default withRouteProps(connect(mapStateToProps, mapDispatchToProps)(SearchTracePageImpl));
