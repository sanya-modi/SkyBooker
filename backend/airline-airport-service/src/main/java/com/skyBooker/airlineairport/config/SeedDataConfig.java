package com.skybooker.airlineairport.config;

import com.skybooker.airlineairport.entity.Airline;
import com.skybooker.airlineairport.entity.Airport;
import com.skybooker.airlineairport.repository.AirlineRepository;
import com.skybooker.airlineairport.repository.AirportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfig {

    private static final String INDIA = "India";

    @Bean
    CommandLineRunner seedAirportsAndAirlines(AirlineRepository airlineRepository, AirportRepository airportRepository) {
        return args -> {
            ensureAirline(airlineRepository, "IndiGo", "6E", "India's largest low-cost carrier", "9876543210", "support@goindigo.in");
            ensureAirline(airlineRepository, "Air India", "AI", "Full-service international carrier", "9876543211", "contact@airindia.com");
            ensureAirline(airlineRepository, "Akasa Air", "QP", "Fast-growing domestic airline", "9876543212", "hello@akasaair.com");
            ensureAirline(airlineRepository, "SpiceJet", "SG", "Low-cost carrier based in Gurgaon", "9876543213", "care@spicejet.com");
            ensureAirline(airlineRepository, "Vistara", "UK", "Full-service premium airline", "9876543214", "customercare@airvistara.com");

            ensureAirport(airportRepository, "Indira Gandhi International Airport", "DEL", "Delhi", INDIA, "Primary airport serving New Delhi", "9876543201", "info@del.airport");
            ensureAirport(airportRepository, "Chhatrapati Shivaji Maharaj International Airport", "BOM", "Mumbai", INDIA, "Major hub serving Mumbai", "9876543202", "info@bom.airport");
            ensureAirport(airportRepository, "Kempegowda International Airport", "BLR", "Bengaluru", INDIA, "International airport serving Bengaluru", "9876543203", "info@blr.airport");
            ensureAirport(airportRepository, "Rajiv Gandhi International Airport", "HYD", "Hyderabad", INDIA, "International airport serving Hyderabad", "9876543204", "info@hyd.airport");
            ensureAirport(airportRepository, "Chennai International Airport", "MAA", "Chennai", INDIA, "International airport serving Chennai", "9876543205", "info@maa.airport");
            ensureAirport(airportRepository, "Netaji Subhas Chandra Bose International Airport", "CCU", "Kolkata", INDIA, "International airport serving Kolkata", "9876543206", "info@ccu.airport");
            ensureAirport(airportRepository, "Cochin International Airport", "COK", "Kochi", INDIA, "International airport serving Kochi", "9876543207", "info@cok.airport");
            ensureAirport(airportRepository, "Pune Airport", "PNQ", "Pune", INDIA, "Domestic and limited international airport serving Pune", "9876543208", "info@pnq.airport");
            ensureAirport(airportRepository, "Sardar Vallabhbhai Patel International Airport", "AMD", "Ahmedabad", INDIA, "International airport serving Ahmedabad", "9876543209", "info@amd.airport");
            ensureAirport(airportRepository, "Goa International Airport", "GOI", "Goa", INDIA, "International airport serving Goa", "9876543215", "info@goi.airport");
            ensureAirport(airportRepository, "Jaipur International Airport", "JAI", "Jaipur", INDIA, "International airport serving Jaipur", "9876543216", "info@jai.airport");
            ensureAirport(airportRepository, "Lokpriya Gopinath Bordoloi International Airport", "GAU", "Guwahati", INDIA, "International airport serving Guwahati", "9876543217", "info@gau.airport");
        };
    }

    private void ensureAirline(AirlineRepository airlineRepository, String name, String iataCode, String description, String phoneNumber, String email) {
        if (airlineRepository.findByIataCode(iataCode).isEmpty()) {
            airlineRepository.save(buildAirline(name, iataCode, description, phoneNumber, email));
        }
    }

    private void ensureAirport(AirportRepository airportRepository, String name, String iataCode, String city, String country, String description, String phoneNumber, String email) {
        if (airportRepository.findByIataCode(iataCode).isEmpty()) {
            airportRepository.save(buildAirport(name, iataCode, city, country, description, phoneNumber, email));
        }
    }

    private Airline buildAirline(String name, String iataCode, String description, String phoneNumber, String email) {
        Airline airline = new Airline();
        airline.setName(name);
        airline.setIataCode(iataCode);
        airline.setDescription(description);
        airline.setPhoneNumber(phoneNumber);
        airline.setEmail(email);
        airline.setIsActive(true);
        return airline;
    }

    private Airport buildAirport(String name, String iataCode, String city, String country, String description, String phoneNumber, String email) {
        Airport airport = new Airport();
        airport.setName(name);
        airport.setIataCode(iataCode);
        airport.setCity(city);
        airport.setCountry(country);
        airport.setDescription(description);
        airport.setPhoneNumber(phoneNumber);
        airport.setEmail(email);
        airport.setIsActive(true);
        return airport;
    }
}
