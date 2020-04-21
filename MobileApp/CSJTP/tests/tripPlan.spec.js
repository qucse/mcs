const expect = require('chai').expect,
	tripPlan = require('../samples/tripSampleComplex.json');

describe('Trip Plan Object Testing', () => {
	describe('Origin Testing', () => {
		it('The origin property should have values latitude: 25.317300275440477, longitude: 51.47581815719604', () => {
			expect(tripPlan.plan.from.lat).to.be.equal(25.317300275440477);
			expect(tripPlan.plan.from.lon).to.be.equal(51.47581815719604);
		});
	});
	describe('Destination Testing', () => {
		it('The destination property should have values latitude: 25.185680253645092, longitude: 51.47300720214843', () => {
			expect(tripPlan.plan.to.lat).to.be.equal(25.263016051488446);
			expect(tripPlan.plan.to.lon).to.be.equal(51.61170959472656);
		});
	});
	describe('Itineraries Testing', () => {
		it('The Trip plan have an array property called itineraries and it has a length of at least 1', () => {
			expect(tripPlan.plan).to.have.property('itineraries');
			expect(tripPlan.plan.itineraries).to.be.a('array');
			expect(tripPlan.plan.itineraries.length).to.be.at.least(1);
		});
		it('Each itinerary entry should have the following properties: walk distance, waiting time, number of transfers, walk time, start time and end time', () => {
			expect(tripPlan.plan.itineraries[0]).to.have.property('walkDistance');
			expect(tripPlan.plan.itineraries[0]).to.have.property('waitingTime');
			expect(tripPlan.plan.itineraries[0]).to.have.property('transfers');
			expect(tripPlan.plan.itineraries[0]).to.have.property('walkTime');
			expect(tripPlan.plan.itineraries[0]).to.have.property('startTime');
			expect(tripPlan.plan.itineraries[0]).to.have.property('endTime');
		});
		describe('Legs Testing', () => {
			it('Each itinerary entry should have an array property called legs and it has a length of at least 1', () => {
				expect(tripPlan.plan.itineraries[0]).to.have.property('legs');
				expect(tripPlan.plan.itineraries[0].legs).to.be.a('array');
				expect(tripPlan.plan.itineraries[0].legs.length).to.be.at.least(1);
			});
			describe('Walking Legs Testing', () => {
				it('If the leg mode is walking, it should have the following properties: mode=walk, distance, from, to, an arrays called steps with length wo be at least 1', () => {
					expect(tripPlan.plan.itineraries[0].legs[0]).to.have.property('mode');
					expect(tripPlan.plan.itineraries[0].legs[0]).to.have.property('distance');
					expect(tripPlan.plan.itineraries[0].legs[0]).to.have.property('from');
					expect(tripPlan.plan.itineraries[0].legs[0]).to.have.property('to');
					expect(tripPlan.plan.itineraries[0].legs[0]).to.have
						.property('steps')
						.and.to.have.length.at.least(1);
				});
				it('Each walking step should have the following properties: distance, relative direction, street name, absolute direction, longitude, latitude', () => {
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('distance');
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('relativeDirection');
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('streetName');
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('absoluteDirection');
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('lon');
					expect(tripPlan.plan.itineraries[0].legs[0].steps[0]).to.have.property('lat');
				});
			});
			describe('Bus Legs Testing', () => {
				it('If the leg mode is bus, it should have the following properties: mode=bus, route name, route number,agency name, origin bus stop, destination bus stop, duration, distance', () => {
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('mode');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('distance');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('from');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('agencyName');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('route');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('headsign');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('to');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('duration');
					expect(tripPlan.plan.itineraries[0].legs[1]).to.have.property('distance');
				});
			});
		});
	});
});
