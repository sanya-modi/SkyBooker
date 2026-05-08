package com.skyBooker.admin.validation;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;

import static org.assertj.core.api.Assertions.assertThat;

class AdminValidationPatternsTest {

    @Test
    void constantsExposeExpectedPatterns() {
        assertThat(AdminValidationPatterns.REPORT_NAME).isEqualTo("^[A-Za-z0-9][A-Za-z0-9\\s&()_.,-]{2,99}$");
        assertThat(AdminValidationPatterns.DESCRIPTION).isEqualTo("^[A-Za-z0-9\\s&()_.,:;!?@#%/+-]{0,500}$");
    }

    @Test
    void privateConstructorExistsForUtilityClass() throws Exception {
        Constructor<AdminValidationPatterns> constructor = AdminValidationPatterns.class.getDeclaredConstructor();

        assertThat(Modifier.isPrivate(constructor.getModifiers())).isTrue();

        constructor.setAccessible(true);
        AdminValidationPatterns instance = constructor.newInstance();

        assertThat(instance).isNotNull();
    }
}
