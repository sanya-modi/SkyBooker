package com.skyBooker.payment;

import com.skyBooker.payment.config.WebConfig;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentSupportClassesTest {

    @Test
    void webConfigCanBeInstantiated() {
        WebConfig config = new WebConfig();

        assertThat(config).isNotNull();
    }

    @Test
    void bookingSnapshotStoresAndReturnsValues() throws Exception {
        Class<?> clazz = Class.forName("com.skyBooker.payment.service.PaymentServiceImpl$BookingSnapshot");
        Constructor<?> constructor = clazz.getDeclaredConstructor();
        constructor.setAccessible(true);
        Object snapshot = constructor.newInstance();

        invoke(clazz, snapshot, "setUserId", Long.class, 3L);
        invoke(clazz, snapshot, "setNumberOfPassengers", Integer.class, 2);
        invoke(clazz, snapshot, "setTotalFare", BigDecimal.class, new BigDecimal("2500"));
        invoke(clazz, snapshot, "setTotalAmount", BigDecimal.class, new BigDecimal("2600"));
        invoke(clazz, snapshot, "setStatus", String.class, "PENDING");
        invoke(clazz, snapshot, "setSelectedSeats", List.class, List.of("1A", "1B"));

        assertThat(invoke(clazz, snapshot, "getUserId")).isEqualTo(3L);
        assertThat(invoke(clazz, snapshot, "getNumberOfPassengers")).isEqualTo(2);
        assertThat(invoke(clazz, snapshot, "getTotalFare")).isEqualTo(new BigDecimal("2500"));
        assertThat(invoke(clazz, snapshot, "getTotalAmount")).isEqualTo(new BigDecimal("2600"));
        assertThat(invoke(clazz, snapshot, "getStatus")).isEqualTo("PENDING");
        assertThat(invoke(clazz, snapshot, "getSelectedSeats")).isEqualTo(List.of("1A", "1B"));
    }

    private Object invoke(Class<?> clazz, Object target, String methodName, Class<?> parameterType, Object value) throws Exception {
        Method method = clazz.getDeclaredMethod(methodName, parameterType);
        method.setAccessible(true);
        return method.invoke(target, value);
    }

    private Object invoke(Class<?> clazz, Object target, String methodName) throws Exception {
        Method method = clazz.getDeclaredMethod(methodName);
        method.setAccessible(true);
        return method.invoke(target);
    }
}
