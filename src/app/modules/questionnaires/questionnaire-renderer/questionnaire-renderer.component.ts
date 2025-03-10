import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { EventService } from 'src/app/core/services/event.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { HouseholdService } from 'src/app/core/services/household.service';
import { EBooleanState, EInterviewee, EState } from 'src/app/core/enums';
import { Model, SurveyModel, CustomError } from 'survey-core';
import {
    ResponseObject,
    convertDate,
    convertDate2,
    populateMaritalStatus,
    populateRelationship,
} from '../../../core/utils/reusable-functions';
import { environment } from 'src/environments/environment';
import { answersDev } from 'src/app/core/utils/reusable-arrays';
import { DataService } from 'src/app/core/services/data.service';
import { debounceTime, of } from 'rxjs';
@Component({
    selector: 'app-questionnaire-renderer',
    templateUrl: './questionnaire-renderer.component.html',
    styleUrls: ['./questionnaire-renderer.component.css'],
})
export class QuestionnaireRendererComponent implements OnInit {
    surveyModel!: Model;
    questionnaires: any[] = [];
    loggedInUser = JSON.parse(this.authService.getItem('user'));
    loading = false;
    isSubmitting = false;
    isUpdatting = false;
    isEditable = false;
    isBasicEditable = false;
    questionnaireType!: EInterviewee;
    questionnaireId!: string;
    memberId!: string;
    ownedCows = 0;
    totalCows = 0;
    ownedGoats = 0;
    totalGoats = 0;
    ownedSheeps = 0;
    totalSheeps = 0;
    ownedPigs = 0;
    totalPigs = 0;
    ownedChickens = 0;
    totalChickens = 0;
    ownedRabbits = 0;
    totalRabbits = 0;
    ownedOther = 0;
    totalOther = 0;
    updatedUser: any;
    loadingUserDetails = true;

    genders: Record<string, string> = {
        M: 'MALE',
        F: 'FEMALE',
    };

    public EInterviewee = EInterviewee;
    public EState = EState;

    constructor(
        private householdService: HouseholdService,
        private authService: AuthService,
        private globalService: GlobalService,
        private router: Router,
        private route: ActivatedRoute,
        private eventService: EventService,
        private dataService: DataService,
        private globaService: GlobalService
    ) {
        this.route.params.subscribe((params: any) => {
            this.questionnaireType = params?.type;
            this.questionnaireId = params?.id;
            this.memberId = params?.memberId;
            this.isEditable =
                (this.router.url.includes('edit') || this.router.url.includes('basic-edit')) &&
                !!this.memberId &&
                !!this.questionnaireType;
            this.isBasicEditable =
                this.router.url.includes('basic-edit') && !!this.memberId && !!this.questionnaireType;
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload() {
        return !!this.householdService.householdPayload.request ||
            !!this.householdService.householdMemberPayload.request
            ? confirm()
            : true;
    }

    ngOnInit(): void {
        this.getActiveQuestionnaire();
    } 

    getUpdateProfileDataHtml(): string {
        return `
            <div id="survey_profile_previw" class="w-full">
                <div class="flex flex-col items-center relative w-full pt-5 pb-6 shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg min-h-64 h-auto md:mt-0">
                    ${this.loadingUserDetails ? `
                        <div class="w-full h-full flex justify-center items-center absolute bg-black/10 top-0 left-0 z-40">
                            <div class="w-auto flex items-center justify-center px-3 py-2 mt-3 bg-white rounded-2xl">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[1.6em] animate-spin">
                                        <path d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2ZM12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17ZM22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12ZM7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12ZM19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L15.5355 16.9497C15.145 16.5592 15.145 15.9261 15.5355 15.5355C15.9261 15.145 16.5592 15.145 16.9497 15.5355L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711ZM8.46447 8.46447C8.07394 8.85499 7.44078 8.85499 7.05025 8.46447L4.92893 6.34315C4.53841 5.95262 4.53841 5.31946 4.92893 4.92893C5.31946 4.53841 5.95262 4.53841 6.34315 4.92893L8.46447 7.05025C8.85499 7.44078 8.85499 8.07394 8.46447 8.46447ZM4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L7.05025 15.5355C7.44078 15.145 8.07394 15.145 8.46447 15.5355C8.85499 15.9261 8.85499 16.5592 8.46447 16.9497L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711ZM15.5355 8.46447C15.145 8.07394 15.145 7.44078 15.5355 7.05025L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L16.9497 8.46447C16.5592 8.85499 15.9261 8.85499 15.5355 8.46447Z" class="fill-gray-600"></path>
                                    </svg>
                                </div>
                                <div class="ml-3 text-[0.98em] font-semibold text-gray-600">LOADING . . .</div>
                            </div>
                        </div>
                    ` : ''}
                    <img class="inline-block w-32 mb-2 rounded-full h-36" src=${
                        this.updatedUser?.photo ??
                        '/assets/avatar.svg'
                    } alt="PI" />
                    ${
                        this.updatedUser &&
                        Object.keys(this.updatedUser)
                            .length > 0 ? `
                                <div class="mb-2 text-sm text-gray-600">${
                                    this.updatedUser.fullName
                                }</div>
                    ${this.updatedUser?.civilStatus ? `
                        <div class="mb-2 text-sm text-gray-600">${this.updatedUser.civilStatus}</div>
                    ` : ''}
                    <div class="mb-2 text-sm text-gray-600">NID / ${
                        this.updatedUser.documentNumber
                    }</div>
                    <div class="mb-2 text-sm text-gray-600">${
                        this.updatedUser.dateOfBirth
                    } | ${this.updatedUser.gender}</div>
                    <div class="w-auto flex items-center justify-center px-3 py-1 mt-3 bg-green-100 rounded-2xl">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[1.4em]">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z" class="fill-green-600"></path>
                            </svg>
                        </div>
                        <div class="text-xs font-semibold ml-2 text-green-600">VERIFIED</div>
                    </div>
                ` : `
                    <div class="flex items-center flex-col w-full mt-4">
                        <div class="mb-2 text-sm text-gray-600">NO USER INFO FOUND</div>
                        <div class="w-auto flex items-center justify-center px-3 py-1 mt-3 bg-yellow-100 rounded-2xl">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-[1.4em]">
                                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z" class="fill-yellow-600"></path>
                                </svg>
                            </div>
                            <div class="text-xs font-semibold ml-2 text-yellow-600">NOT VERIFIED</div>
                        </div>
                    </div>
                `}
                </div>
            </div>
        `
    }

    replaceProfilePreview(newHtml: string) {
        const profileDiv = document.getElementById("survey_profile_previw");
        if (profileDiv) {
            profileDiv.outerHTML = newHtml;
        }
    }   
    
    getUserInfo(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.dataService.getExternalRecord(id).subscribe((res: any) => {
                if (res.status) {
                    this.updatedUser = {
                        ...res.response,
                        fullName: `${res.response.foreName} ${res.response.surnames}`,
                        gender: this.genders[res.response.sex],
                        civilStatus: res.response.maritalStatus.toUpperCase(),
                        photo: `data:image/jpg;base64,${res.response.photo}`
                    };
                } else {
                    this.globaService.openFailureSnackBar('User details not found');
                    this.updatedUser = {};
                }
                
                this.loadingUserDetails = false;
                const newHtml = this.getUpdateProfileDataHtml();
                // survey.setValue("profile_html_preview", newHtml); CANNOT REPLACE DUE TO RE-RENDER ISSUE
                this.replaceProfilePreview(newHtml);
                resolve();
            },
            (error) => {
                reject(error);
            });
        });
    }

    getActiveQuestionnaire(): void {
        this.loading = true;
        this.householdService.getActiveQuestionnaire(this.questionnaireType).subscribe((res: ResponseObject<any>) => {
            if (res.status) {
                this.questionnaireId = res.response[0].id;
                let survey: any = {};
                let updatedUser: any;

                // NOTE: SHOULD BE CHANGED WHEN SURVEY PAGES CHANGES TOO
                // This is to temporary remove the other sections of the survey and
                // leave the demograph data only to be updated
                if (this.isBasicEditable) {
                    const surveyJsonObject = JSON.parse(res.response[0]?.jsonObject);
                    this.updatedUser = this.householdService.householdPayload.data;
                    updatedUser = {
                        ...this.updatedUser,
                        documentNumber: this.updatedUser.documentNumber?.replaceAll(' ', ''),
                    };
                    const newSurveyJsonObject = {
                        ...surveyJsonObject,
                        pages: (surveyJsonObject?.pages ?? [])
                            .filter((page: { name: string }) => page?.name === 'page1')
                            .map((page: { name: string; title: string; elements: any[] }) => {
                                if (page?.name === 'page1') {
                                    return {
                                        ...page,
                                        title: `${page?.title} ${this.updatedUser?.memberCode ? '(Member Code: ' +
                                            this.updatedUser?.memberCode + ')' : ''}`,
                                        elements: page.elements.map((element, index) => {
                                            if (index === 0) {
                                                return {
                                                    ...element,
                                                    elements: element.elements.map(
                                                        (nestedElement: { elements: any[] }, nestedIndex: number) => {
                                                            if (nestedIndex === 0) {
                                                                return {
                                                                    ...nestedElement,
                                                                    elements: [
                                                                        {
                                                                            type: 'html',
                                                                            name: 'profile_html_preview',
                                                                            html: this.getUpdateProfileDataHtml(),
                                                                        },
                                                                        ...nestedElement.elements.map(
                                                                            (question: any) => ({
                                                                                ...question,
                                                                                readOnly: false,
                                                                                enableIf: true,
                                                                                startWithNewLine: (
                                                                                    question?.name === 'Q1_8' && 
                                                                                    this.questionnaireType === EInterviewee.HOUSEHOLD
                                                                                ) || question?.name === 'Q1_6' || (
                                                                                    (question?.name === 'Q1_1' && this.questionnaireType === EInterviewee.PERSON)
                                                                                ) 
                                                                                    ? false
                                                                                    : (question?.name === 'Q1_8' && this.questionnaireType === EInterviewee.PERSON) 
                                                                                        ? true 
                                                                                        : Object.prototype.hasOwnProperty.call(
                                                                                            question,
                                                                                            'startWithNewLine'
                                                                                        )
                                                                                            ? question?.startWithNewLine
                                                                                            : true,
                                                                            })
                                                                        ),
                                                                    ],
                                                                };
                                                            }
                                                            return nestedElement;
                                                        }
                                                    ),
                                                };
                                            }
                                            return element;
                                        }),
                                    };
                                }
                                return page;
                            }),
                    };
                    const stringifiedSurveyJson = JSON.stringify(newSurveyJsonObject);
                    this.surveyModel = survey = new SurveyModel(stringifiedSurveyJson);
                } else {
                    this.surveyModel = survey = new SurveyModel(res.response[0]?.jsonObject);
                }
                if (!this.isEditable) {
                    if (this.questionnaireType === EInterviewee.HOUSEHOLD) {
                        const { headDocumentNumber } = this.householdService.householdPayload.request;
                        const { foreName, surnames, dateOfBirth, maritalStatus, sex } =
                            this.householdService.householdPayload.data.fetchedUser;
                        const { upis, educationLevel, incomeLevel, disabilityLevel } =
                            this.householdService.householdPayload.data;
                        const answersJson = {
                            Q1_8: headDocumentNumber,
                            Q1_1: foreName + ' ' + surnames,
                            Q1_3: sex === 'M' ? '2' : '1',
                            Q1_4: convertDate(dateOfBirth),
                            Q1_5: populateMaritalStatus(maritalStatus.toUpperCase()),
                            Q1_15: educationLevel ? educationLevel.toString() : '',
                            Q2_17: upis && upis.length > 0 ? '1' : '',
                            Q2_18: upis && upis.length > 0 ? '1' : '',
                            Q2_20: upis && upis.length > 0 && upis.length,
                            Q2_21: upis && upis.length > 0 && upis.length,
                            Q2_22: upis,
                            Q3_6: incomeLevel ? incomeLevel.toString() : '',
                            Q1_9: disabilityLevel !== null ? '1' : '2',
                            Q1_11: disabilityLevel !== null ? disabilityLevel.toString() : null,
                        };
                        if (!environment.production) {
                            const answerData = { ...answersDev, ...answersJson };
                            survey.data = answerData;
                        } else {
                            const answerData = answersJson;
                            survey.data = answerData;
                        }
                    } else {
                        const { request, data } = this.householdService.householdMemberPayload;
                        const {
                            documentNumber,
                            firstName,
                            lastName,
                            gender,
                            maritalStatus,
                            identificationType,
                            membershipType,
                        } = request;

                        const dateOfBirth = data.fetchedUser?.dateOfBirth
                            ? data.fetchedUser.dateOfBirth
                            : request.dateOfBirth;

                        const educationLevel = data.educationLevel ? data.educationLevel.toString() : '';
                        const incomeLevel = data.incomeLevel ? data.incomeLevel.toString() : '';
                        const disabilityLevel = data.disabilityLevel ? data.disabilityLevel.toString() : null;

                        const answersJson = {
                            Q1_8: documentNumber,
                            Q1_1: firstName + ' ' + lastName,
                            Q1_2: populateRelationship(membershipType),
                            Q1_3: gender === 'MALE' ? '2' : '1',
                            Q1_6: identificationType === 'NATIONAL_ID' ? '1' : '2',
                            Q1_4: identificationType === 'NONE' ? convertDate2(dateOfBirth) : convertDate(dateOfBirth),
                            Q1_5: populateMaritalStatus(maritalStatus.toUpperCase()),
                            Q1_15: educationLevel,
                            Q3_6: incomeLevel ? incomeLevel.toString() : '',
                            Q1_9: disabilityLevel !== null ? '1' : '2',
                            Q1_11: disabilityLevel !== null ? disabilityLevel : null,
                        };
                        const answerData = answersJson;
                        survey.data = answerData;
                    }
                    this.loading = false;
                } else {
                    this.householdService
                        .getQuestionnaireAnswersDraft(this.questionnaireId, this.memberId)
                        .subscribe(async (res) => {
                            this.loading = false;
                            if (res?.status) {
                                const answerData: any = res.response[0];
                                if (answerData?.id) {
                                    survey.data = JSON.parse(answerData.responseJsonObject);
                                    const nationalId = JSON.parse(answerData.responseJsonObject)['Q1_8'];
                                    if (
                                        nationalId &&
                                        // this.updatedUser &&
                                        // Object.keys(this.updatedUser).length <= 0 &&
                                        this.memberId
                                    ) {
                                        await this.getUserInfo(nationalId);
                                        if (this.updatedUser) updatedUser = {
                                            ...this.updatedUser,
                                            documentNumber: this.updatedUser.documentNumber?.replaceAll(' ', ''),
                                        };
                                    } else {
                                        this.updatedUser = {};
                                        this.loadingUserDetails = false;
                                        const timeoutSession = setTimeout(() => {
                                            const newHtml = this.getUpdateProfileDataHtml();
                                            this.replaceProfilePreview(newHtml);
                                            clearTimeout(timeoutSession);
                                        }, 200)
                                    }
                                }
                            }
                        });
                }

                if (this.questionnaireType === EInterviewee.HOUSEHOLD) {
                    const matArr: string[] = [
                        'bought',
                        'mpgVup',
                        'farg',
                        'rdrc',
                        'ubudehe',
                        'girinka',
                        'reproduction',
                        'indagizanyo',
                        'other',
                    ];

                    survey.onMatrixCellCreated?.add((survey: any, options: any) => {
                        if (options.columnName === 'number') {
                            options.cellQuestion.visible = options.rowValue['ownershipType'] === '1' ? true : false;
                        }

                        if (options.columnName === 'numberOfLivestocks') {
                            options.cellQuestion.visible = options.rowValue['ownership'] === '1' ? true : false;
                        }

                        matArr.forEach((e: any) => {
                            if (options.columnName === e) {
                                options.cellQuestion.visible = options.rowValue['ownership'] === '1' ? true : false;
                            }
                        });

                        if (options.columnName === 'howOften') {
                            options.cellQuestion.visible = options.rowValue['haveYouBenefited'] === '1' ? true : false;
                        }

                        if (options.columnName === 'numberOfTimes') {
                            options.cellQuestion.visible =
                                options.rowValue['howOften'] === '1' || options.rowValue['howOften'] === '2'
                                    ? true
                                    : false;
                        }

                        if (options.columnName === 'soldCrops') {
                            options.cellQuestion.visible = options.rowValue['haveYouHarvested'] === '1' ? true : false;
                        }
                    });

                    survey.onMatrixCellValueChanged?.add((survey: any, options: any) => {
                        if (options.columnName === 'ownershipType') {
                            const question = options.getCellQuestion('number');
                            question.visible = options.value === '1' ? true : false;
                            question.value = null;
                        }

                        if (options.columnName === 'ownership') {
                            const question = options.getCellQuestion('numberOfLivestocks');
                            question.visible = options.value === '1' ? true : false;
                            question.value = null;
                        }

                        matArr.forEach((e: string) => {
                            if (options.columnName === 'ownership') {
                                const question = options.getCellQuestion(e);
                                question.visible = options.value === '1' ? true : false;
                                question.value = null;
                            }
                        });

                        if (options.columnName === 'haveYouBenefited') {
                            const question = options.getCellQuestion('howOften');
                            question.visible = options.value === '1' ? true : false;
                            question.value = null;
                        }

                        if (options.columnName === 'howOften') {
                            const question = options.getCellQuestion('numberOfTimes');
                            question.visible = options.value === '1' || options.value === '2' ? true : false;
                            question.value = null;
                        }

                        if (options.columnName === 'haveYouHarvested') {
                            const question = options.getCellQuestion('soldCrops');
                            question.visible = options.value === '1' ? true : false;
                            question.value = null;
                        }

                        // compute livestocks numbers on entry
                        if (options.question.name === 'livestocks') {
                            if (options.row.name === 'cow') {
                                this.ownedCows = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalCows =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }

                            if (options.row.name === 'goat') {
                                this.ownedGoats = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalGoats =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                            if (options.row.name === 'sheep') {
                                this.ownedSheeps = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalSheeps =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                            if (options.row.name === 'pig') {
                                this.ownedPigs = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalPigs =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                            if (options.row.name === 'chicken') {
                                this.ownedChickens = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalChickens =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                            if (options.row.name === 'rabbit') {
                                this.ownedRabbits = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalRabbits =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                            if (options.row.name === 'other') {
                                this.ownedOther = options.row.value['numberOfLivestocks']
                                    ? Number(options.row.value['numberOfLivestocks'])
                                    : 0;

                                const bought = options.row.value['bought'] ? Number(options.row.value['bought']) : 0;
                                const mpgVup = options.row.value['mpgVup'] ? Number(options.row.value['mpgVup']) : 0;
                                const farg = options.row.value['farg'] ? Number(options.row.value['farg']) : 0;
                                const rdrc = options.row.value['rdrc'] ? Number(options.row.value['rdrc']) : 0;
                                const ubudehe = options.row.value['ubudehe'] ? Number(options.row.value['ubudehe']) : 0;
                                const girinka = options.row.value['girinka'] ? Number(options.row.value['girinka']) : 0;
                                const reprod = options.row.value['reproduction']
                                    ? Number(options.row.value['reproduction'])
                                    : 0;
                                const indagizanyo = options.row.value['indagizanyo']
                                    ? Number(options.row.value['indagizanyo'])
                                    : 0;
                                const other = options.row.value['other'] ? Number(options.row.value['other']) : 0;
                                this.totalOther =
                                    bought + mpgVup + farg + rdrc + ubudehe + girinka + reprod + indagizanyo + other;
                            }
                        }
                    });
                }

                survey.onAfterRenderQuestion?.add((survey: any, options: any) => {
                    if (options.question.name === "Q1_8") {
                        const inputElement = options.htmlElement.querySelector("input");
                
                        if (inputElement) {
                            inputElement.addEventListener("input", (event: any) => {
                                const newValue = event.target.value;
                                const questionName = 'Q1_8';
                                const isPersonWithNoNationalId = 
                                    this.questionnaireType === EInterviewee.PERSON && 
                                    survey?.data['Q1_6'] === '1' && 
                                    !updatedUser?.documentNumber;

                                if ((
                                    (updatedUser && updatedUser?.documentNumber) || 
                                    isPersonWithNoNationalId
                                ) && newValue) {
                                    const expectedPrefix = updatedUser?.documentNumber?.substring(0, 13);
                                    const userInputPrefix = newValue?.substring(0, 13);
                                    const question = survey.getQuestionByName(questionName);

                                    if (question) {
                                        const errorMessage = 'The first 13 characters must match the document number.';
                                        const errorExists = question.errors.some((error: any) => error.text === errorMessage);

                                        if (userInputPrefix !== expectedPrefix && !errorExists && !isPersonWithNoNationalId) {
                                            question.addError(new CustomError(errorMessage));
                                            this.globalService.openFailureSnackBar(
                                                `Provided Document Number Should Have the 13 Digits Matching!`
                                            );
                                        } else if ((userInputPrefix === expectedPrefix) || isPersonWithNoNationalId) {
                                            question.clearErrors();
                                            if (newValue.length === 16) {
                                                of(newValue)
                                                    .pipe(debounceTime(1000))
                                                    .subscribe((val: string | null) => {
                                                        if (val !== '' && val !== null) {
                                                            this.loadingUserDetails = true;
                                                            const newHtml = this.getUpdateProfileDataHtml();
                                                            this.replaceProfilePreview(newHtml);
                                                            this.getUserInfo(val);
                                                        }
                                                    });
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                });

                survey.onValueChanged?.add((survey: any, options: any) => {
                    // CHANGIN FORM STATE
                });

                survey.showPreviewBeforeComplete = 'showAnsweredQuestions';
                survey.previewText = 'Preview Answers';
                survey.completeText = !this.isEditable ? 'Complete' : 'Update';

                survey.onComplete?.add((survey: any, options: any) => {
                    if (!this.isEditable) {
                        if (survey?.data) {
                            if (this.questionnaireType === EInterviewee.HOUSEHOLD) {
                                this.loading = true;
                                const requestPayload = {
                                    ...this.householdService.householdPayload.request,
                                    questionnaireId: this.questionnaireId,
                                    survey: survey?.data,
                                };
                                this.householdService.createHouseholdSurvey(requestPayload).subscribe((res) => {
                                    this.processResponse(res);
                                });
                            } else {
                                this.loading = true;
                                const { request, data } = this.householdService.householdMemberPayload;
                                const requestPayload = {
                                    memberModel: request,
                                    questionnaireId: this.questionnaireId,
                                    survey: survey?.data,
                                };
                                this.householdService
                                    .createHouseholdMemberSurvey(data.householdId, requestPayload)
                                    .subscribe((res) => {
                                        this.processResponse(res);
                                    });
                            }
                        }
                    } else {
                        this.loading = true;
                        this.householdService
                            .updateQuestionnaireAnswers(
                                this.questionnaireId,
                                this.memberId,
                                survey?.data,
                                this.isBasicEditable ? EBooleanState.YES : EBooleanState.NO
                            )
                            .subscribe((res) => {
                                if (res.status) {
                                    this.householdService
                                        .saveQuestionnaireAnswersDraft(
                                            this.questionnaireId,
                                            this.memberId,
                                            survey?.data
                                        )
                                        .subscribe((res2) => {
                                            this.processResponse(res2);
                                        });
                                } else {
                                    this.processResponse(res);
                                }
                            });
                    }
                });

                survey.onCurrentPageChanging?.add((sender: any, options: any) => {
                    // livestocks validation
                    let message = '';

                    switch (true) {
                        case this.ownedCows !== this.totalCows:
                            message = `cow('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedGoats !== this.totalGoats:
                            message = `goat('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedSheeps !== this.totalSheeps:
                            message = `sheep('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedPigs !== this.totalPigs:
                            message = `pig('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedChickens !== this.totalChickens:
                            message = `chicken('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedRabbits !== this.totalRabbits:
                            message = `rabit('s')`;
                            options.allowChanging = false;
                            break;
                        case this.ownedOther !== this.totalOther:
                            message = `oher('s')`;
                            options.allowChanging = false;
                            break;
                    }
                    if (options.allowChanging === false) {
                        this.globalService.openFailureSnackBar(
                            `The total number of ${message} must be equal to the number of sources provided`
                        );
                    }
                });
            } else {
                this.loading = false;
                this.questionnaires = [];
                this.globalService.openFailureSnackBar(res.message);
            }
        });
    }

    createQuestionnaire(): void {
        this.isSubmitting = true;
    }

    processResponse(res: any): void {
        if (res.status) {
            this.loading = false;
            this.globalService.openSuccessSnackBar(res.message);
            this.router.navigate(['/admin/households']);
            this.eventService.onActionFinished({
                name: 'households',
                pagination: this.householdService.previousPagination,
            });
        } else {
            this.globalService.openFailureSnackBar(res.message);
            this.getActiveQuestionnaire();
        }
    }
}
