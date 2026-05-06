package com.skyBooker.seat.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Seat Validation Patterns Tests")
class SeatValidationPatternsTest {

    private final Pattern seatNumberPattern = Pattern.compile(SeatValidationPatterns.SEAT_NUMBER);

    // ================= VALID SEAT NUMBERS =================

    @Nested
    @DisplayName("Valid Seat Numbers")
    class ValidSeatNumbersTests {

        @ParameterizedTest
        @ValueSource(strings = {"1A", "1B", "1C", "1D", "1E", "1F"})
        void singleDigitSeatNumbersWithAllColumns(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be valid", seatNumber)
                    .isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {"10A", "12B", "99C", "50D"})
        void doubleDigitSeatNumbers(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be valid", seatNumber)
                    .isTrue();
        }

        @ParameterizedTest
        @ValueSource(strings = {"100A", "123B", "999C", "150D", "200E"})
        void tripleDigitSeatNumbers(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be valid", seatNumber)
                    .isTrue();
        }

        @Test
        void seatNumber1A() {
            assertThat(seatNumberPattern.matcher("1A").matches()).isTrue();
        }

        @Test
        void seatNumber999F() {
            assertThat(seatNumberPattern.matcher("999F").matches()).isTrue();
        }
    }

    // ================= INVALID SEAT NUMBERS =================

    @Nested
    @DisplayName("Invalid Seat Numbers")
    class InvalidSeatNumbersTests {

        @ParameterizedTest
        @ValueSource(strings = {"0A", "0B", "0C"})
        void zeroRowNumber(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be invalid (row 0)", seatNumber)
                    .isFalse();
        }

        @ParameterizedTest
        @ValueSource(strings = {"1G", "1H", "1Z", "1X"})
        void invalidColumnLetters(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be invalid (column > F)", seatNumber)
                    .isFalse();
        }

        @ParameterizedTest
        @ValueSource(strings = {"1", "A", "AB", "1234A", "12345A"})
        void missingOrInvalidFormat(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be invalid (format)", seatNumber)
                    .isFalse();
        }

        @ParameterizedTest
        @ValueSource(strings = {"A1", "a1", "1a"})
        void incorrectOrder(String seatNumber) {
            assertThat(seatNumberPattern.matcher(seatNumber).matches())
                    .as("Seat number %s should be invalid (incorrect order)", seatNumber)
                    .isFalse();
        }

        @Test
        void emptyString() {
            assertThat(seatNumberPattern.matcher("").matches()).isFalse();
        }

        @Test
        void nullValue() {
            try {
                seatNumberPattern.matcher(null).matches();
                assertThat(false).as("Should have thrown NullPointerException").isTrue();
            } catch (NullPointerException e) {
                assertThat(e).isNotNull();
            }
        }

        @Test
        void spaceInSeatNumber() {
            assertThat(seatNumberPattern.matcher("1 A").matches()).isFalse();
        }

        @Test
        void specialCharacters() {
            assertThat(seatNumberPattern.matcher("1@A").matches()).isFalse();
        }

        @Test
        void lowerCaseLetter() {
            assertThat(seatNumberPattern.matcher("1a").matches()).isFalse();
        }
    }

    // ================= EDGE CASES =================

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCasesTests {

        @Test
        void leadingZero() {
            assertThat(seatNumberPattern.matcher("01A").matches()).isFalse();
        }

        @Test
        void negativeNumber() {
            assertThat(seatNumberPattern.matcher("-1A").matches()).isFalse();
        }

        @Test
        void extraCharacters() {
            assertThat(seatNumberPattern.matcher("1A1").matches()).isFalse();
        }

        @Test
        void multipleSeatNumbers() {
            assertThat(seatNumberPattern.matcher("1A2B").matches()).isFalse();
        }

        @Test
        void decimalNumber() {
            assertThat(seatNumberPattern.matcher("1.5A").matches()).isFalse();
        }
    }

    // ================= BOUNDARY TESTS =================

    @Nested
    @DisplayName("Boundary Tests")
    class BoundaryTests {

        @Test
        void minimumValidSeatNumber() {
            assertThat(seatNumberPattern.matcher("1A").matches()).isTrue();
        }

        @Test
        void maximumValidSeatNumber() {
            assertThat(seatNumberPattern.matcher("999F").matches()).isTrue();
        }

        @Test
        void justBelowMinimum() {
            assertThat(seatNumberPattern.matcher("0A").matches()).isFalse();
        }

        @Test
        void justAboveMaximum() {
            assertThat(seatNumberPattern.matcher("1000A").matches()).isFalse();
        }
    }

    // ================= PATTERN VALIDATION =================

    @Nested
    @DisplayName("Pattern Validation")
    class PatternValidationTests {

        @Test
        void patternIsNotNull() {
            assertThat(SeatValidationPatterns.SEAT_NUMBER).isNotNull();
        }

        @Test
        void patternIsNotEmpty() {
            assertThat(SeatValidationPatterns.SEAT_NUMBER).isNotEmpty();
        }

        @Test
        void patternIsRegexString() {
            assertThat(SeatValidationPatterns.SEAT_NUMBER).contains("^", "$");
        }

        @Test
        void canCompilePattern() {
            try {
                Pattern.compile(SeatValidationPatterns.SEAT_NUMBER);
                assertThat(true).isTrue();
            } catch (Exception e) {
                assertThat(false).as("Should not throw exception: " + e.getMessage()).isTrue();
            }
        }
    }

    // ================= COMPREHENSIVE VALID EXAMPLES =================

    @Nested
    @DisplayName("Comprehensive Valid Examples")
    class ComprehensiveValidExamplesTests {

        @Test
        void allValidSeatNumbersInFirstThreeRows() {
            String[] validSeats = {
                    "1A", "1B", "1C", "1D", "1E", "1F",
                    "2A", "2B", "2C", "2D", "2E", "2F",
                    "3A", "3B", "3C", "3D", "3E", "3F"
            };

            for (String seat : validSeats) {
                assertThat(seatNumberPattern.matcher(seat).matches())
                        .as("Seat %s should be valid", seat)
                        .isTrue();
            }
        }

        @Test
        void allValidSeatNumbersInDoubleDigitRows() {
            String[] validSeats = {
                    "10A", "20B", "30C", "40D", "50E", "60F",
                    "99A", "99B", "99C", "99D", "99E", "99F"
            };

            for (String seat : validSeats) {
                assertThat(seatNumberPattern.matcher(seat).matches())
                        .as("Seat %s should be valid", seat)
                        .isTrue();
            }
        }
    }
}