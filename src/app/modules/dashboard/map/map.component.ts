import { getJurisdictionFirstLetter } from '../../../core/utils/reusable-functions';
import { HouseholdService } from 'src/app/core/services/household.service';
import { EventService } from 'src/app/core/services/event.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { EJurisdiction } from 'src/app/core/enums';
import { TranslationService } from 'src/app/core/services/translation.service';
import { booleanIntersects } from '@turf/turf'

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, AfterViewInit {
    private map!: L.Map;
    selectedFilter: any;
    layerData: any;
    baseLayer: any;
    clicked = false;
    bounds: any;
    lastLayer: any = [];
    lastBounds: any = [];
    previousLayer: any;
    previousLayer_: any;
    mapData: any[] = [];
    // markers: L.Marker[] = [
    //   L.marker([31.9539, 35.9106]), // Amman
    //   L.marker([32.5568, 35.8469]) // Irbid
    // ];

    getJurisdiction(level: string): any {
        switch (level) {
            case 'ADM1':
                return 'PROVINCE';
            case 'ADM2':
                return 'DISTRICT';
            case 'ADM3':
                return 'SECTOR';
            case 'ADM4':
                return 'CELL';
            case 'ADM5':
                return 'VILLAGE';
            default:
                return null; // You can change this to handle other cases if needed
        }
    }

    getAdminLevel(jurisdiction: string): any {
        switch (jurisdiction) {
            case 'NATIONAL':
                return 'ADM1';
            case 'PROVINCE':
                return 'ADM1';
            case 'DISTRICT':
                return 'ADM2';
            case 'SECTOR':
                return 'ADM3';
            case 'CELL':
                return 'ADM4';
            case 'VILLAGE':
                return 'ADM5';
            default:
                return null; // You can change this to handle other cases if needed
        }
    }

    getNewLevel(jurisdiction: string): any {
        switch (jurisdiction) {
            case 'ADM1':
                return 'ADM2';
            case 'ADM2':
                return 'ADM3';
            case 'ADM3':
                return 'ADM4';
            case 'ADM4':
                return 'ADM5';
            case 'ADM5':
                return 'ADM5';
            default:
                return null; // You can change this to handle other cases if needed
        }
    }

    textTranslated = '';
    translatedTexts: string[] = ['households']; // translated texts --> PLEASE do NOT modify the array values

    constructor(
        private eventService: EventService,
        private householdService: HouseholdService,
        private translationService: TranslationService
    ) {}

    ngOnInit() {
        this.listenToEvent();
        this.centerMap();
        this.translationService.getInstantTranslations(this.translatedTexts[0]).subscribe((res) => {
            this.textTranslated = res;
            console.log(this.textTranslated);
        });
    }

    listenToEvent(): void {
        this.eventService.locationFilterEvent.subscribe((evt) => {
            if (evt) {
                if (this.selectedFilter?.id === evt.id) {
                    return;
                }
                this.selectedFilter = evt;
                this.centerMap();
            }
        });
    }

    ngAfterViewInit() {
        this.initializeMap();
    }

    private initializeMap() {
        const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.map = this.map = L.map('map', {
            center: [-1.994264, 30.025942],
            zoom: 9,
            minZoom: 9, // Set your desired minimum zoom level here
            maxZoom: 18, // Set your desired maximum zoom level here
        });

        this.baseLayer = L.tileLayer(baseMapURl).addTo(this.map);
        const customControl = L.Control.extend({
            options: {
                position: 'topright', // Change the position as needed
            },

            onAdd: () => {
                const container = L.DomUtil.create('div', 'custom-button');
                container.innerHTML = 'Reset';
                container.style.cursor = 'pointer';
                container.style.backgroundColor = 'black';
                container.style.color = 'white';
                container.style.padding = '3px';

                // Add a click event to the custom button
                container.addEventListener('click', () => {
                    // Perform your custom action here
                    this.map.eachLayer((layer) => {
                        // Check if the layer is not the base tile layer
                        if (layer !== this.baseLayer) {
                            this.map.removeLayer(layer);
                        }
                    });
                    // Perform your action here
                    this.centerMap();
                });

                return container;
            },
        });

        const customBackControl = L.Control.extend({
            options: {
                position: 'topleft', // Change the position as needed
            },

            onAdd: () => {
                const container = L.DomUtil.create('div', 'custom-button');
                container.innerHTML = 'Back';
                container.style.cursor = 'pointer';
                container.style.backgroundColor = 'black';
                container.style.color = 'white';
                container.style.padding = '3px';

                // Add a click event to the custom button
                container.addEventListener('click', () => {
                    // Perform your custom action here
                    this.map.eachLayer((layer) => {
                        // Check if the layer is not the base tile layer
                        if (layer !== this.baseLayer) {
                            this.map.removeLayer(layer);
                        }
                    });
                    // Perform your action here
                    if (this.lastLayer.length > 1) {
                        this.previousLayer = this.lastLayer.at(-1);
                        this.lastLayer.at(-1).addTo(this.map);
                        this.map.fitBounds(this.lastLayer.at(-1).getBounds());
                        this.map.eachLayer((layer: any) => {
                            if (
                                layer !== this.lastBounds[this.lastBounds.length - 2] &&
                                this.lastBounds[this.lastBounds.length - 2] &&
                                layer instanceof L.Polygon
                            ) {
                                console.log('ok');
                                // Check if the layer's bounds fall outside the bounds of newLayer
                                if (
                                    !this.lastBounds[this.lastBounds.length - 2]
                                        .getBounds()
                                        .intersects(layer.getBounds())
                                ) {
                                    // console.log(layer.feature?.properties.shapeName)
                                    this.map.removeLayer(layer);
                                } else {
                                    // console.log(this.previousLayer)
                                }
                            }
                        });
                        this.lastLayer = this.lastLayer.slice(0, -1);
                        this.lastBounds = this.lastBounds.slice(0, -1);
                    } else {
                        this.centerMap();
                    }
                });

                return container;
            },
        });

        // Add the custom control to the map
        this.map.addControl(new customControl());
        this.map.addControl(new customBackControl());
    }

    private centerMap() {
        // Create a LatLngBounds object to encompass all the marker locations
        const adminLevel = this.getAdminLevel(this.selectedFilter?.type);
        fetch(`../../../assets/geojson/${adminLevel ? adminLevel : 'ADM1'}.geojson`)
            .then((response) => response.json())
            .then((data) => {
                if (this.previousLayer) {
                    this.map.removeLayer(this.previousLayer);
                }

                if (this.selectedFilter?.type === EJurisdiction.NATIONAL || !this.selectedFilter?.type) {
                    this.getMapData(data, 'GET_MAP_HOUSEHOLDS_NATIONAL', EJurisdiction.NATIONAL, '');
                } else {
                    const shape = data.features.find((el: { properties: { shapeName: string } }) =>
                        el.properties.shapeName.toLowerCase().includes(this.selectedFilter?.name.toLowerCase())
                    );
                    this.getMapData(
                        shape,
                        'GET_MAP_HOUSEHOLDS_LOCATION',
                        this.selectedFilter?.type,
                        this.selectedFilter?.id
                    );
                }
            });
    }

    getLayerData(level: string, code_: string, jurisdiction_: string, locationId: string): void {
        if (this.previousLayer_) {
            this.map.removeLayer(this.previousLayer_);
        }
        fetch(`../../../assets/geojson/${level}.geojson`)
            .then((response) => response.json())
            .then((data) => {
                this.layerData = data;
                this.getMapData(data, code_, jurisdiction_, locationId, true);
            });
    }

    // Function to build clusters of connected features
    buildClusters(features: Array<any>) {
        const clusters: Array<any> = [];

        features.forEach((feature: any) => {
            let addedToExistingCluster = false;

            // Check all clusters for intersection
            for (const cluster of clusters) {
                for (const clusteredFeature of cluster) {
                    if (booleanIntersects(feature, clusteredFeature)) {
                        cluster.push(feature);
                        addedToExistingCluster = true;
                        break;
                    }
                }
                if (addedToExistingCluster) break;
            }

            // If the feature does not fit into any existing cluster, create a new cluster
            if (!addedToExistingCluster) {
                clusters.push([feature]);
            }
        });

        // Merge clusters that have intersecting features
        let merged = true;
        while (merged) {
            merged = false;
            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    if (clusters[i].some((f1: any) => clusters[j].some(
                        (f2: any) => booleanIntersects(f1, f2)))
                    ) {
                        clusters[i] = clusters[i].concat(clusters[j]);
                        clusters.splice(j, 1);
                        merged = true;
                        break;
                    }
                }
                if (merged) break;
            }
        }

        return clusters;
    }

    // Function to find the most dense cluster
    findMostDenseCluster(clusters: any) {
        return clusters.reduce((maxCluster: Array<any>, currentCluster: Array<any>) => {
            return (currentCluster.length > maxCluster.length) ? currentCluster : maxCluster
        }, []);
    }

    getMapData(data: any, code_: string, jurisdiction_: string, locationId: string, isLayer = false) {
        const code = code_;
        const args = { locationId: locationId };
        const jurisdiction = jurisdiction_;

        const body = {
            queryCode: code,
            args: args,
            jurisdiction: jurisdiction,
        };
        this.householdService.getDashboardData(body).subscribe(
            (response) => {
                if (response.status) {
                    const jurisdictionNames = new Set(response.response.result.map(
                        (el: { name: string }) => el.name.toLowerCase()
                    ));

                    const selectedFeatures = data.features.filter((feature: { properties: { shapeName: string } }) => {
                        const { shapeName } = feature.properties;
                        const name = shapeName.toLowerCase();

                        if (jurisdictionNames.has(name)) {
                            return true;
                        }
                        return false;
                    });

                    // THE NEW APPROACH
                    // Gather all the features regardless of the location on the map and then cluster together
                    // the nearest or closest to each other.
                    // This solves having morethan one features being highlighted on the map when they are found 
                    // to have similar or matching name hence highlight those clustered in an administrative location only.

                    // NOTE: This is a potential solution and may change in the future but for now it is the best that can work well!!!!
                    
                    const clusters = this.buildClusters(selectedFeatures) ?? []
                    const mostDenseCluster = this.findMostDenseCluster(clusters)

                    const geojsonLayer = L.geoJSON(mostDenseCluster, {
                        onEachFeature: async (feature, layer: L.Polygon) => {
                            // let featureData: { value: { toLocaleString: (arg0: string, arg1: {}) => any }; id: string };
                            // if(this.selectedFilter?.type===EJurisdiction.NATIONAL||!this.selectedFilter?.type){
                            const featureData = await response.response.result.find(
                                (el: { name: string }) => el.name === feature.properties.shapeName
                            );
                            // console.log(featureData)
                            const tooltipContent = `${feature.properties.shapeName} (${getJurisdictionFirstLetter(
                                layer.feature?.properties.shapeType
                            )}) <br>${this.textTranslated}: ${featureData?.value?.toLocaleString('en-US', {})}`;
                            // }else{
                            //   featureData = {value:response.response.result.reduce((sum: any, item: any) => sum + item.value, 0)}
                            //   tooltipContent = `${feature.properties.shapeName}<br>Households: ${featureData?.value?.toLocaleString('en-US',{})}`;
                            // }
                            layer.bindTooltip(tooltipContent, { permanent: true, direction: 'top' });
                            // Add a click event listener to the layer.
                            if (layer.feature?.properties.shapeType !== 'ADM5') {
                                layer.on('click', (e) => {
                                    this.clicked = false;

                                    const newLayer = L.geoJSON(e.target.feature).addTo(this.map);
                                    this.bounds = newLayer;
                                    this.lastBounds.push(newLayer);
                                    // Check if the click is inside the specific feature.
                                    const level = this.getNewLevel(e.target.feature.properties.shapeType);
                                    const jurisdiction = this.getJurisdiction(e.target.feature.properties.shapeType);
                                    this.getLayerData(
                                        level,
                                        'GET_MAP_HOUSEHOLDS_LOCATION',
                                        jurisdiction,
                                        featureData.id
                                    );

                                    // Zoom in to the selected feature's bounds.
                                    if (this.previousLayer) {
                                        this.lastLayer.push(this.previousLayer);
                                        this.map.removeLayer(this.previousLayer);
                                    }
                                    setTimeout(() => {
                                        this.clicked = true;
                                        // this.map.setZoom(10)
                                        this.map.fitBounds(newLayer.getBounds());
                                    }, 1000);
                                });
                            }
                        },
                    }).addTo(this.map);

                    this.previousLayer = geojsonLayer;
                    
                    this.map.eachLayer((layer: any) => {
                        // NOTE: THIS CODE HAS BEEN COMMENTED DUE TO INCONSISTENCES IN THE MAP GEOJSON DATA
    
                        // EXPLANATION: The current geojson data does not identifiy a cell or village to its direct 
                        // administrative dependent (sector) with a unique identifiy so the filtering is only possible by
                        // feature name and the location name of which they match at a-time with the same administrative levels
                        // hence causing inconsistences or even mis-information
    
                        // SCROLL UP TO "THE NEW APPROACH"

                        // if (layer !== this.bounds && this.bounds && layer instanceof L.Polygon && isLayer) {
                        //     // Check if the layer's bounds fall outside the bounds of newLayer
                        //     if (!this.bounds.getBounds().intersects(layer.getBounds())) {
                        //         // console.log(layer.feature?.properties.shapeName)
                        //         this.map.removeLayer(layer);
                        //     } else {
                        //         // console.log(this.previousLayer)
                        //     }
                        // }
                        if (layer == this.bounds) {
                            this.map.removeLayer(layer); // This removes the previous administrative level
                        }
                    });

                    this.map.fitBounds(geojsonLayer.getBounds());
                } else {
                    console.error('API request returned unsuccessful response.');
                }
            },
            (error) => {
                console.error('Error loading dashboard data:', error);
            }
        );
    }
}
