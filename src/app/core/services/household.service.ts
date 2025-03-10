// import { TargetingComponent } from './../../targeting/targeting.component';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { EBooleanState, EInterviewee, EMembershipType } from 'src/app/core/enums';
import { environment } from 'src/environments/environment';
import { initPaginate } from '../utils/reusable-functions';
import { CreateHousehold, HouseholdMemberObject, HouseholdMovment } from '../../modules/shared/interfaces/household';
import ITargetGroup from '../models/targeting-program';
import { CreatePartnerDistribution } from 'src/app/modules/shared/interfaces/partner-distribution';
import { EStorageLocation } from '../enums/storage.enum';

@Injectable({
    providedIn: 'root',
})
export class HouseholdService {
    baseUrl = environment.baseurl + '/households/';
    dashboardUrl = environment.baseurl + '/reporting/';
    landIntegrationUrl = environment.baseurl + '/land/upi/details';
    landIntegrationUrl2 = environment.baseurl + '/land/individual/upis/details';
    migrationUrl = environment.baseurl + '/households/migration/'
    previousPagination = initPaginate();
    selectedHid!: string | null;
    selectedQuestionnaire: any;
    householdPayload = {
        request: {} as any,
        data: {} as any,
    };
    householdMemberPayload = {
        request: {} as any,
        data: { householdId: '', fetchedUser: {} } as any,
    };
    targetGroups!: ITargetGroup[];

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;
            return throwError(() => errMessage);
            // return Observable.throw(err.text() || 'backend server error');
        }
        return throwError(() => error || 'Server error');
    }

    get getTargetGroups() {
        return this.targetGroups;
    }

    setTargetingProgramData(evt: any): void {
        this.targetGroups = evt;
    }

    // UPI validation
    UPI(control: AbstractControl): ValidationErrors | null {
        if (control.value !== null) {
            const res = control.value.match(/^[0-9]\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[-0-9]{1,9}$/);
            if (res === null) {
                return { upi: true };
            }
            return null;
        }
        return null;
    }

    // get all households
    getHouseholds(
        juridiction: string,
        locationId: string,
        pagination = initPaginate(),
        query = '',
        status = '',
        searchBy = ''
    ): Observable<any> {
        const url = this.baseUrl + `search/${juridiction}/${locationId}`;
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.set('query', query);
        headers = headers.set('status', status);
        headers = headers.set('searchBy', searchBy);

        const options = { headers, params };
        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // get household details by code
    getHouseholdByCode(code: string): Observable<any> {
        const url = this.baseUrl + code;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getActiveProgramsCount(): Observable<any> {
        const url = environment.baseurl + '/reporting/household/program/count';
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getActiveCutoffCount(): Observable<any> {
        const url = environment.baseurl + '/reporting/household/cutoff/count';
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // get household members
    getHouseholdMembers(householdId: string): Observable<any> {
        const url = this.baseUrl + householdId + '/members';
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // get households ids assigned to a parasocial user
    getParasocialHouseholdsIds(userId: string): Observable<any> {
        const url = environment.baseurl + '/users/user/parasocial/by-id';
        let headers = new HttpHeaders();
        headers = headers.set('id', userId);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // get households assigned to a parasocial user
    getParasocialHouseholds(ids: { [key: string]: any[] }, pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + 'ids';
        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        const options = { params };

        return this.http.post(url, ids, options).pipe(catchError(this.handleError));
    }

    // validate household Head / Member Existence
    validateHouseholdHeadOrMember(householdHeadOrMemberNid: string, householdHeadOrMemberNames: string): Observable<any> {
        const url = this.baseUrl + 'check/household-head/exist';
        let headers = new HttpHeaders();
        headers = headers.set('householdHeadNid', householdHeadOrMemberNid);
        headers = headers.set('names', householdHeadOrMemberNames);

        const options = { headers };

        return this.http.post(url, {}, options).pipe(catchError(this.handleError));
    }

    // get household public appeals
    getHouseholdAppeals(headDocumentNumber: string, pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + 'appeals/document-number/' + headDocumentNumber;
        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        return this.http.get(url, { params }).pipe(catchError(this.handleError));
    }

    // get household member nida details
    getHouseholdHeadNidaDetails(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'nida/details';

        let headers = new HttpHeaders();
        headers = headers.set('identificationNumber', documentNumber);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // get household member nida details
    getHouseholdMemberNidaDetails(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'nida/details/member/';
        let headers = new HttpHeaders();
        headers = headers.set('identificationNumber', documentNumber);

        const options = { headers };
        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // disable, enable, delete household
    householdAction(householdId: string, action: string): Observable<any> {
        const url = this.baseUrl + householdId + '/' + action;
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }

    // get land details
    getLandDetails(upi: string): Observable<any> {
        const url = this.landIntegrationUrl;
        let headers = new HttpHeaders();
        headers = headers.set('upi', upi);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getLandDetails2(documentNumber: string): Observable<any> {
        const url = this.landIntegrationUrl2;
        let headers = new HttpHeaders();
        headers = headers.set('documentNumber', documentNumber);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // create household
    createHousehold(request: CreateHousehold): Observable<any> {
        const url = this.baseUrl + 'create/household';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // create household member
    createHouseholdMember(householdId: string, request: Partial<HouseholdMemberObject>): Observable<any> {
        const url = this.baseUrl + 'create/' + householdId + '/household-member';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // delete household member
    deleteHouseholdMember(memberId: string, householdId: string, reason: string): Observable<any> {
        const url = this.baseUrl + 'remove/household-member';

        let headers = new HttpHeaders();

        headers = headers.set('memberId', memberId);
        headers = headers.set('householdId', householdId);
        headers = headers.set('reason', reason);

        return this.http.post(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // transer household member
    transferHouseholdMember(householdId: string, memberId: string): Observable<any> {
        const url = this.baseUrl + 'transfer/member';

        let headers = new HttpHeaders();

        headers = headers.set('newHouseholdId', householdId);
        headers = headers.set('memberId', memberId);

        return this.http.post(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    transferHouseholdHead(newHouseholdId: string, householdHeadId: string): Observable<any> {
        const url = this.baseUrl + 'transfer/household-head';

        let headers = new HttpHeaders();

        headers = headers.set('newHouseholdId', newHouseholdId);
        headers = headers.set('householdHeadId', householdHeadId);

        return this.http.post(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // update household member
    updateHouseholdMember(householdId: string, request: Partial<HouseholdMemberObject>): Observable<any> {
        const url = this.baseUrl + 'update/' + householdId + '/household-member';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // create household transfer request
    createHouseholdTransferRequest(request: Partial<HouseholdMovment>): Observable<any> {
        const url = this.baseUrl + 'transfer';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // create household archive request
    createHouseholdArchiveRequest(request: Partial<HouseholdMovment>): Observable<any> {
        const url = this.baseUrl + 'archive';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // fetch user photo by id and memebership type
    getUserPhoto(identificationNumber: string, membershipType: EMembershipType): Observable<any> {
        const url = this.baseUrl + 'view/member/photo';

        let headers = new HttpHeaders();
        headers = headers.set('identificationNumber', identificationNumber);
        headers = headers.set('membershipType', membershipType);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getJuridictionLocation(juridiction: string, locationId: string): Observable<any> {
        const url = this.baseUrl + `locations/jurisdiction/location/${locationId}/jurisdiction/${juridiction}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getScoringStatus(): Observable<any> {
        const url = this.baseUrl + `scoring/status`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getJuridictionDashboard(juridiction: string, locationId: string): Observable<any> {
        const url = environment.baseurl + `/reporting/household/location`;
        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', juridiction);
        headers = headers.set('locationId', locationId);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getPopulationWithDisabilities(): Observable<any> {
        const url = this.dashboardUrl + `/count/Population/WithDisabilities`;
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }

    getJuridictionDashboardPrograms(juridiction: string, locationId: string, total: number): Observable<any> {
        const url = environment.baseurl + `/reporting/household/program`;
        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', juridiction);
        headers = headers.set('locationId', locationId);
        headers = headers.set('total', `${total}`);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getPendingTransfers(jurisdiction: string, locationId: string): Observable<any> {
        const url = this.baseUrl + `pending/transfer/count`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', jurisdiction);
        headers = headers.set('locationId', locationId);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getPendingTranslations(jurisdiction: string, locationId: string): Observable<any> {
        const url = this.baseUrl + `pending/transfer/count`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', jurisdiction);
        headers = headers.set('locationId', locationId);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getPendingArchives(jurisdiction: string, locationId: string): Observable<any> {
        const url = this.baseUrl + `pending/archive/count`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', jurisdiction);
        headers = headers.set('locationId', locationId);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getHouseholdTransfers(householdId: string): Observable<any> {
        const url = this.baseUrl + `view/tranfer/` + householdId;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getVillagesByCellCode(cellCode: string): Observable<any> {
        const url = this.baseUrl + `locations/villages/cell/code/` + cellCode;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getVillageByCode(villageCode: string): Observable<any> {
        const url = this.baseUrl + `locations/village/code/` + villageCode;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getHouseholdByDocumentNumber(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'view/household/by-document-number';

        let headers = new HttpHeaders();
        headers = headers.set('documentNumber', documentNumber);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getAppealsCountByStatus(status: string, jurisdiction: string, locationId: string): Observable<any> {
        const url = this.baseUrl + `appeals/count/${status}`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', jurisdiction);
        headers = headers.set('locationId', locationId);
        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getAppealsByHousehold(householdId: string, pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `appeals/household/` + householdId;

        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        return this.http.get(url, { params }).pipe(catchError(this.handleError));
    }

    getTransferRequests(
        jurisdiction: string,
        locationId: string,
        query: string,
        status: string,
        pagination = initPaginate()
    ): Observable<any> {
        const url = this.baseUrl + `search-transfer/${jurisdiction}/${locationId}`;

        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.set('query', query);
        headers = headers.set('status', status);

        return this.http.get(url, { params, headers }).pipe(catchError(this.handleError));
    }

    getArchivesRequests(
        jurisdiction: string,
        locationId: string,
        query: string,
        status: string,
        pagination = initPaginate()
    ): Observable<any> {
        const url = this.baseUrl + `search-archive/${jurisdiction}/${locationId}`;

        let params = new HttpParams();
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.set('query', query);
        headers = headers.set('status', status);

        return this.http.get(url, { params, headers }).pipe(catchError(this.handleError));
    }

    /*
      ? QUESTIONNAIRE POST/PUT APIs
    */

    // create survey
    createSurvey(survey: string): Observable<any> {
        const url = this.baseUrl + 'survey/create';
        return this.http.post(url, { name: survey }).pipe(catchError(this.handleError));
    }

    // update survey
    updateSurvey(survey: string, id: string): Observable<any> {
        const url = this.baseUrl + 'survey/update';
        let headers = new HttpHeaders();
        headers = headers.set('surveyId', id);

        return this.http.put(url, { name: survey }, { headers }).pipe(catchError(this.handleError));
    }

    // action on survey
    actionSurvey(action: string, id: string): Observable<any> {
        const url = this.baseUrl + 'survey/' + action;
        let headers = new HttpHeaders();
        headers = headers.set('surveyId', id);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // create questionnaire
    createQuestionnaire(intervieweeType: EInterviewee, surveyId: string, request: any): Observable<any> {
        const url = this.baseUrl + 'questionnaire/create';
        let headers = new HttpHeaders();
        headers = headers.set('intervieweeType', `${intervieweeType}`);
        headers = headers.set('surveyId', `${surveyId}`);

        return this.http.post(url, request, { headers }).pipe(catchError(this.handleError));
    }

    // update questionnaire
    updateQuestionnaire(intervieweeType: EInterviewee, questionnaireId: string, request: any): Observable<any> {
        const url = this.baseUrl + 'questionnaire/update';
        let headers = new HttpHeaders();
        headers = headers.set('intervieweeType', `${intervieweeType}`);
        headers = headers.set('questionnaireId', `${questionnaireId}`);

        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    // update criteria
    updateCriteriaName(request: any): Observable<any> {
        const url = this.baseUrl + 'targeting/program/criteria/update';
        return this.http.put(url, request, {}).pipe(catchError(this.handleError));
    }

    // enable questionnaire
    enableQuestionnaire(questionnaireId: string): Observable<any> {
        const url = this.baseUrl + 'questionnaire/enable';
        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', `${questionnaireId}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // get questionnaire
    getQuestionnaireByID(questionnaireId: string): Observable<any> {
        const url = this.baseUrl + 'questionnaire/id';
        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', `${questionnaireId}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // archive questionnaire
    archiveQuestionnaire(questionnaireId: string): Observable<any> {
        const url = this.baseUrl + 'questionnaire/archive';
        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', `${questionnaireId}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // questionnaire coefficient single answer update
    coefficientSingleQuestionnaireAnswerUPdate(answerId: string, score: string): Observable<any> {
        const url = this.baseUrl + 'answer/coefficient/update/id';
        let headers = new HttpHeaders();
        headers = headers.set('answerId', `${answerId}`);
        headers = headers.set('score ', `${score}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // questionnaire coefficient bulk answer update
    coefficientBulkQuestionnaireAnswerUPdate(request: any): Observable<any> {
        const url = this.baseUrl + 'answer/coefficients/update';
        return this.http.put(url, request).pipe(catchError(this.handleError));
    }

    /*
      ? QUESTIONNAIRE GET APIs
    */

    // get all questionnaire
    getAllQuestionnaires(pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `questionnaire/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get all active questionnaire
    getAllActiveQuestionnaires(pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `questionnaire/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get active questionnaire
    getActiveQuestionnaire(memberType: EInterviewee): Observable<any> {
        const url = this.baseUrl + `questionnaire/all/active/member-type`;

        let headers = new HttpHeaders();
        headers = headers.set('memberType', `${memberType}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get question answer
    getQuestionnaireQuestionAnswers(id: string): Observable<any> {
        const url = this.baseUrl + `question/${id}`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // get all surveys
    getAllSurveys(pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `survey/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get questionnaire questions and answers
    getAllQuestionnaireQuestions(questionnaireId: string, pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `questions/questionnaire-id`;

        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', `${questionnaireId}`);
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get respondent questions sections
    getAllRespondentQuestions(respondentType: string): Observable<any> {
        const url = this.baseUrl + `questions/respondent-type/sections`;

        let headers = new HttpHeaders();
        headers = headers.set('respondentType', `${respondentType}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get all sections [new]
    getAllSections(): Observable<any> {
        const url = this.baseUrl + `questionnaire/sections`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // get all questions by section [new]
    getAllQuestionsBySection(section: string): Observable<any> {
        const url = this.baseUrl + `questions/section`;
        let headers = new HttpHeaders();
        headers = headers.set('section', `${section}`);
        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get respondent questions
    getAllRespondentQuestionsBySection(respondentType: string, section: string): Observable<any> {
        const url = this.baseUrl + `questions/respondent-type/section`;

        let headers = new HttpHeaders();
        headers = headers.set('respondentType', `${respondentType}`);
        headers = headers.set('section', `${section}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // get household member answers
    getHouseholdMemberAnswers(memberId: string): Observable<any> {
        const url = this.baseUrl + `members/${memberId}/answers`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }
    // get household answers
    getHouseholdAnswers(memberId: string): Observable<any> {
        const url = this.baseUrl + `household/${memberId}/answers`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // get household profile answers
    getHouseholdAnswersByProfile(userId: string): Observable<any> {
        const url = this.baseUrl + `household/${userId}/profile`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    /*
      ?CREATE SURVEY WITH ANSWERS
    */

    // create household survey
    createHouseholdSurvey(request: any): Observable<any> {
        const url = this.baseUrl + 'create/household-with-answers';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }
    // create household member
    createHouseholdMemberSurvey(householdId: string, request: any): Observable<any> {
        const url = this.baseUrl + `create/${householdId}/household-member-with-answers`;
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    /*
      ?TARGETING APIS
    */
    getAllCuttoffs(pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getAllActiveCuttoffs(pagination = initPaginate()): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/all/active`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getAllActiveQuestionnaire(): Observable<any> {
        const url = this.baseUrl + `questionnaire/all/active`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getAlterAllCuttOffs(
        jurisdiction: any,
        cutOffId: string,
        locationId: string,
        query: string,
        status: string,
        searchBy = '',
        pagination = initPaginate()
    ): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/households/all`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', `${jurisdiction}`);
        headers = headers.set('cutOffId', `${cutOffId}`);
        headers = headers.set('locationId', `${locationId}`);
        headers = headers.set('query', `${query}`);
        headers = headers.set('status', `${status}`);
        headers = headers.set('searchBy', `${searchBy}`);
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getAllProgramsHouseholds(
        jurisdiction: any,
        programId: string,
        locationId: string,
        query: string,
        status: string,
        searchBy = '',
        pagination = initPaginate()
    ): Observable<any> {
        const url = this.baseUrl + `targeting/program/households/filtered`;

        let headers = new HttpHeaders();
        headers = headers.set('jurisdiction', `${jurisdiction}`);
        headers = headers.set('programId', `${programId}`);
        headers = headers.set('locationId', `${locationId}`);
        headers = headers.set('query', `${query}`);
        headers = headers.set('status', `${status}`);
        headers = headers.set('searchBy', `${searchBy}`);
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    createCutOff(request: any): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/create`;
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    updateCutOff(cutoffId: string, request: any): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/update`;
        let headers = new HttpHeaders();
        headers = headers.set('cutoffId', `${cutoffId}`);
        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    getAllPrograms(query: string, pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + `targeting/program/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    createProgram(request: any): Observable<any> {
        const url = this.baseUrl + `targeting/program/create`;
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    updateProgram(programId: string, request: any): Observable<any> {
        const url = this.baseUrl + `targeting/program/update`;
        let headers = new HttpHeaders();
        headers = headers.set('programId', `${programId}`);
        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    getProgramTargetGroup(id: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/target-group/criteria/all`;

        let headers = new HttpHeaders();
        headers = headers.set('programId', `${id}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    reRunTargetingProgram(id: string): Observable<any> {
        const url = this.baseUrl + 'targeting/program/run';

        let headers = new HttpHeaders();
        headers = headers.set('programId', `${id}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    // TODO START UPDATING PROCESS
    updateTargetingGroup(id: string, request: any): Observable<any> {
        const url = this.baseUrl + 'targeting/program/target-group/update';

        let headers = new HttpHeaders();
        headers = headers.set('targetGroupId', `${id}`);

        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    updateCategory(id: string, request: any): Observable<any> {
        const url = this.baseUrl + 'targeting/program/target-group/update';

        let headers = new HttpHeaders();
        headers = headers.set('targetCategoryId ', `${id}`);

        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    updateCriteria(request: any): Observable<any> {
        const url = this.baseUrl + 'targeting/program/criteria/update';
        return this.http.put(url, request).pipe(catchError(this.handleError));
    }

    actionProgram(programId: string, action: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/` + action;

        let headers = new HttpHeaders();
        headers = headers.set('programId', `${programId}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    actionProgramCriteria(filterCriteriaId: string, action: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/criteria/` + action;
        let headers = new HttpHeaders();
        headers = headers.set('filterCriteriaId', filterCriteriaId);
        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    actionTargetingGroup(id: string, action: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/target-group/` + action;
        let headers = new HttpHeaders();
        headers = headers.set('targetGroupId', id);
        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    actionTargetCategory(id: string, action: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/target-category/` + action;
        let headers = new HttpHeaders();
        headers = headers.set('targetCategoryId', id);
        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    getCutoffById(cutoffId: string): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/id`;

        let headers = new HttpHeaders();
        headers = headers.set('cutoffId', `${cutoffId}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getProgramId(programId: string): Observable<any> {
        const url = this.baseUrl + `targeting/program/id`;

        let headers = new HttpHeaders();
        headers = headers.set('programId', `${programId}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    searchCutoff(query: string): Observable<any> {
        const url = this.baseUrl + `targeting/cutoff/search`;

        let headers = new HttpHeaders();
        headers = headers.set('query', `${query}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    triggerScoring(): Observable<any> {
        const url = this.baseUrl + `scoring`;
        return this.http.put(url, {}).pipe(catchError(this.handleError));
    }
    loadAllDashboard(): Observable<any> {
        const url = this.dashboardUrl + 'dashboard/load-all-dashboard-definition';
        return this.http.get(url).pipe(
          timeout(300000), // 300 seconds timeout
          catchError(this.handleError));
    }

    loadActiveDashboards(): Observable<any> {
        const url = this.dashboardUrl + 'dashboard/load-all-dashboard-definition/by-status';
        let headers = new HttpHeaders();
        headers = headers.set('status', 'ACTIVE');
        return this.http.get(url, { headers }).pipe(
          timeout(300000), // 300 seconds timeout
          catchError(this.handleError));
    }

    getDashboardsByCategoryName(categoryName: string): Observable<any> {
        const url = this.dashboardUrl + 'dashboard/load-all-dashboard-definition/by-category-and-status';
        let headers = new HttpHeaders();
        headers = headers.set('status', 'ACTIVE').set('categoryName', categoryName);
        return this.http.get(url, { headers }).pipe(
          timeout(300000), // 300 seconds timeout
          catchError(this.handleError));
    }

    changeDashboardStatus(title: string, status: string): Observable<any> {
        const url = this.baseUrl + 'dashboard/change/dashboard-status';
        let headers = new HttpHeaders();
        headers = headers.set('dashboardTitle', title);
        headers = headers.set('status', status);
        return this.http.post(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    getDashboardData(body: any): Observable<any> {
        const url = this.dashboardUrl + 'get-dashboard-data';
        return this.http.post(url, body).pipe(
        timeout(300000), // 300 seconds timeout
        catchError(this.handleError));
    }

    createDashboardCategory(body: any): Observable<any> {
        const url = this.baseUrl + 'dashboard/create/category';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    updateDashboardCategory(id: any, body: any): Observable<any> {
        const url = this.baseUrl + 'dashboard/update/category';
        let headers = new HttpHeaders();
        headers = headers.set('id', id);
        return this.http.post(url, body, { headers }).pipe(catchError(this.handleError));
    }

    getDashboardCategories(): Observable<any> {
        const url = this.baseUrl + 'dashboard/all-dashboard-categories';
        return this.http.post(url, {}).pipe(
          timeout(300000), // 300 seconds timeout
          catchError(this.handleError));
    }

    getDashboardsByCategory(category: string): Observable<any> {
        const url = this.baseUrl + 'dashboard/find-dashboard-category-by-name';
        return this.http.post(url, {}).pipe(
          timeout(300000), // 300 seconds timeout
          catchError(this.handleError));
    }

    createDashboard(body: any): Observable<any> {
        const url = this.baseUrl + 'dashboard/create';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    updateDashboard(body: any): Observable<any> {
        const url = this.baseUrl + 'dashboard/update';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    getTargetingReportByUser(userId: string, pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + 'report/user-id';

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('userId', `${userId}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    getTargetingReport(pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + 'report';

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    createTargetingReport(body: any): Observable<any> {
        const url = this.baseUrl + 'report';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    createTargetingReportHousehold(body: any): Observable<any> {
        const url = this.dashboardUrl + 'submit';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    getReportModel(pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + 'report/report-model';

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    retryReportModel(reportId: string): Observable<any> {
        const url = this.baseUrl + 'report/retry';

        let headers = new HttpHeaders();
        headers = headers.set('reportId', `${reportId}`);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    createTargetingReportModel(body: any): Observable<any> {
        const url = this.baseUrl + 'report/report-model';
        return this.http.post(url, body).pipe(catchError(this.handleError));
    }

    updateTargetingReportModel(reportModelId: string, request: any): Observable<any> {
        const url = this.baseUrl + 'report/report-model';
        let headers = new HttpHeaders();
        headers = headers.set('reportModelId', reportModelId);

        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    actionReportModel(reportModelId: string, action: string): Observable<any> {
        const url = this.baseUrl + 'report/report-model/' + action;
        let headers = new HttpHeaders();
        headers = headers.set('reportModelId', reportModelId);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    viewReportData(reportlId: string, pagination = initPaginate(1, 10)): Observable<any> {
        const url = this.dashboardUrl + 'view/data';
        let headers = new HttpHeaders();
        headers = headers.set('reportId', reportlId);
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    updateQuestionDisplayValues(questionId: string, displayValue: string): Observable<any> {
        const url = this.baseUrl + 'question/display-value/update/id';
        let headers = new HttpHeaders();
        headers = headers.set('questionId', questionId);
        headers = headers.set('displayValue', displayValue);

        return this.http.put(url, {}, { headers }).pipe(catchError(this.handleError));
    }

    downloadReport(reportlId: string): Observable<any> {
        const url = this.dashboardUrl + 'download/' + reportlId;
        return this.http.get(url, { responseType: 'blob' }).pipe(catchError(this.handleError));
    }

    // get eduction details by document  number
    getEducationDetails(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'academic/by-document-number';

        let headers = new HttpHeaders();
        headers = headers.set('documentNumber', documentNumber);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // get income details by document  number
    getIncomeDetails(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'income/by-document-number';

        let headers = new HttpHeaders();
        headers = headers.set('documentNumber', documentNumber);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    // get disability details by document  number
    getDisabilityDetails(documentNumber: string): Observable<any> {
        const url = this.baseUrl + 'disability/by-document-number';

        let headers = new HttpHeaders();
        headers = headers.set('documentNumber', documentNumber);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    getQuestionnaireAnswersDraft(questionnaireId: string, respondentId: string): Observable<any> {
        const url = this.baseUrl + 'answers/all';

        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', questionnaireId);
        headers = headers.set('respondentId', respondentId);

        const options = { headers };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }

    updateQuestionnaireAnswers(questionnaireId: string, respondentId: string, request: any, isUpdatingDemographicsOnly: EBooleanState): Observable<any> {
        const url = this.baseUrl + 'answers/update';

        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', questionnaireId);
        headers = headers.set('respondentId', respondentId);
        headers = headers.set('isUpdatingDemographicsOnly', isUpdatingDemographicsOnly);

        return this.http.put(url, request, { headers }).pipe(catchError(this.handleError));
    }

    saveQuestionnaireAnswersDraft(questionnaireId: string, respondentId: string, request: any): Observable<any> {
        const url = this.baseUrl + 'answers/save/draft';

        let headers = new HttpHeaders();
        headers = headers.set('questionnaireId', questionnaireId);
        headers = headers.set('respondentId', respondentId);

        return this.http.post(url, request, { headers }).pipe(catchError(this.handleError));
    }

    // get all ISPMIS households
    getISPMISHouseholds(
        program: string,
        startDate: string,
        endDate: string,
        pagination = initPaginate(),
    ): Observable<any> {
        const url = this.baseUrl + `beneficiary/ispmis`;
        let params = new HttpParams();

        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.set('program', program);
        headers = headers.set('startDate', startDate);
        headers = headers.set('endDate', endDate);

        const options = { headers, params };
        return this.http.get(url, options).pipe(catchError(this.handleError));
    }



    // NOTE: This is the revamped targeting program api ---> NOT_YET_STABLE
    // CAUTION: Don't remove the original apis before stability is confirmed
    // Previous api for targeting are still located in this file above

    // **** GET MASTER PROGRAMS
    getAllRevampedPrograms(query: string, pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/all`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // **** GET PROGRAM COMPONENTS
    getAllRevampedProgramComponents(programId: string, query: string, pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/${programId}/components`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // **** GET MASTER PROGRAM DETAILS
    getRevampedMasterProgramDetails(programId: string): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/master-program/details/${programId}`;

        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // **** GET PROGRAM COMPONENT DETAILS
    getRevampedProgramComponentDetails(programComponentId: string): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/program-component/details/${programComponentId}`;

        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // **** GET ALL PROGRAM COMPONENT BATCHES
    getAllRevampedProgramComponentBatches(programComponentId: string): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/program-component/${programComponentId}/batches/all`;

        return this.http.get(url).pipe(catchError(this.handleError));
    }

    // **** GET EXTERNAL PARTIES BENEFICIARY DISTRIBUTIONS
    getAllExternalPartnerDistributions(query: string, pagination = initPaginate(1, 20)): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/external-partners/distributions`;

        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // **** CREATE NEW PARTNER DISTRIBUTION
    createPartnerBeneficiaryDistribution(request: CreatePartnerDistribution): Observable<any> {
        const url = this.baseUrl + 'revamped-targeting/external-partners/create-distribution';
        return this.http.post(url, request).pipe(catchError(this.handleError));
    }

    // **** GET ALL BENEFICIARIES IN PROGRAM COMPONENT BATCH
    getAllBeneficiariesInProgramComponentBatch(batchId: string, query: string, pagination = initPaginate(1, 20)): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        const url = this.baseUrl + `revamped-targeting/revamped-program/program-component/batch/${batchId}/beneficiaries/all`;

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // **** GET ALL BENEFICIARIES IN PARTNER DISTRIBUTION
    getAllBeneficiariesInPartnerDistribution(distributionId: string, externalPartnerId: string, query: string, pagination = initPaginate(1, 20)): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.set('pageNumber', `${pagination.page}`);
        headers = headers.set('pageSize', `${pagination.size}`);
        headers = headers.set('query', `${query}`);

        const url = this.baseUrl + `revamped-targeting/external-partners/distributions/${distributionId}/${externalPartnerId}/beneficiary/all`;

        return this.http.get(url, { headers }).pipe(catchError(this.handleError));
    }

    // **** CREATE AND RUN NEW BATCH UNDER PROGRAM COMPONENT
    createAndRunNewProgramComponentBatch(programComponentId: string): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/revamped-program/run/${programComponentId}`;
        return this.http.post(url, {}).pipe(catchError(this.handleError));
    }

    // **** RUN PARTNER DISTRIBUTION TO POPULATE BENEFICIARIES
    runPartnerDistributionAndPopulateBeneficiaries(distributionId: string): Observable<any> {
        const url = this.baseUrl + `revamped-targeting/external-partners/distributions/${distributionId}/run-distribution`;
        return this.http.get(url).pipe(catchError(this.handleError));
    }


    // NOTE: This is the RSSB migration apis, NOT YET STABLE
    // ? to be mocked as of now since there is no data

    // **** GET PENDING SRIS/MIS HOUSEHOLDS
    getPendingMigrationHouseholds(
        storageLocation: EStorageLocation,
        juridiction: string,
        locationId: string,
        pagination = initPaginate(),
        status = '',
    ): Observable<any> {
        const url = this.migrationUrl + `${storageLocation.toLowerCase()}/pending`;
        let params = new HttpParams();

        params = params.append('jurisdiction', `${juridiction}`);
        params = params.append('locationId', `${locationId}`);
        params = params.append('page', `${pagination.page}`);
        params = params.append('size', `${pagination.size}`);

        let headers = new HttpHeaders();
        headers = headers.set('status', status);

        const options = { headers, params };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }


    // **** GET SRIS/MIS HEAD BY ID
    getMigrationHeadByNationalID(
      storageLocation: EStorageLocation,
      nationalId: string,
    ): Observable<any> {
        const url = this.migrationUrl + `${storageLocation.toLowerCase()}/head`;
        let params = new HttpParams();

        params = params.append('nationalId', `${nationalId}`);

        const options = { params };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }


    // **** GET SRIS/MIS MEMBERS BY HOUSEHOLD ID
    getMigrationMembersByID(
      storageLocation: EStorageLocation,
      householdId: string,
    ): Observable<any> {
        const url = this.migrationUrl + `${storageLocation.toLowerCase()}/members`;
        let params = new HttpParams();

        params = params.append('householdId', `${householdId}`);

        const options = { params };

        return this.http.get(url, options).pipe(catchError(this.handleError));
    }


    // **** UPDATE MIS/SRIS HOUSEHOLD
    getSrisMisHousehold(
      storageLocation: EStorageLocation,
      householdId: string,
    ): Observable<any> {
        const url = this.migrationUrl + `update`;

        let headers = new HttpHeaders();
        headers = headers.set('storageLocation', `${storageLocation}`);
        headers = headers.set('householdId', `${householdId}`);

        const options = { headers };

        return this.http.put(url, {}, options).pipe(catchError(this.handleError));
    }

    // **** HARD DELETE SRIS member
    deleteSrisMember(
      memberId: string,
      householdId: string
    ): Observable<any> {
        const url = this.migrationUrl + `delete-member`;

        let headers = new HttpHeaders();

        headers = headers.set('householdId', `${householdId}`);
        headers = headers.set('memberId', `${memberId}`);

        const options = { headers };

        return this.http.delete(url, options, ).pipe(catchError(this.handleError));
    }

        // **** UPDATE SRIS MEMBER
        updateSrisMember(
          householdId: string,
          payload: any
        ): Observable<any> {
            const url = this.migrationUrl + `update-member`;

            let headers = new HttpHeaders();

            headers = headers.set('householdId', `${householdId}`);

            const options = { headers };

            return this.http.put(url, payload, options ).pipe(catchError(this.handleError));
        }


}
