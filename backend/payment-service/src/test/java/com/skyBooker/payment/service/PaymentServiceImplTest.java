package com.skyBooker.payment.service;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.PaymentClient;
import com.razorpay.RazorpayClient;
import com.skyBooker.payment.config.RazorpayProvider;
import com.skyBooker.payment.dto.PaymentVerificationRequest;
import com.skyBooker.payment.dto.RazorpayOrderRequest;
import com.skyBooker.payment.entity.Payment;
import com.skyBooker.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository repo;

    @Mock
    private RazorpayProvider razorpayProvider;

    @InjectMocks
    private PaymentServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "razorpayKeyId", "rzp_test_key");
        ReflectionTestUtils.setField(service, "razorpayKeySecret", "secret");
        ReflectionTestUtils.setField(service, "razorpayWebhookSecret", "webhook-secret");
        ReflectionTestUtils.setField(service, "bookingBaseUrl", "http://booking-service");
    }

    @Test
    void createRazorpayOrderReturnsExistingPendingPayment() {
        Payment existing = samplePayment();
        existing.setStatus(Payment.PaymentStatus.PENDING);

        when(repo.findTopByBookingIdOrderByTransactionDateDesc(2L)).thenReturn(Optional.of(existing));

        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(3L, "PENDING", 1, List.of("1A"), "2500", "2500"))) {
            var response = service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John");

            assertThat(response.getOrderId()).isEqualTo("order_123");
            assertThat(response.getKeyId()).isEqualTo("rzp_test_key");
        }
    }

    @Test
    void createRazorpayOrderCreatesNewOrderWhenPendingPaymentNotReusable() throws Exception {
        RazorpayClient client = mock(RazorpayClient.class);
        OrderClient orderClient = mock(OrderClient.class);
        Order order = mock(Order.class);
        ReflectionTestUtils.setField(client, "orders", orderClient);

        when(repo.findTopByBookingIdOrderByTransactionDateDesc(2L)).thenReturn(Optional.empty());
        when(repo.findSuccessfulPaymentByBookingId(2L)).thenReturn(Optional.empty());
        when(razorpayProvider.getClient()).thenReturn(client);
        when(orderClient.create(any())).thenReturn(order);
        when(order.get("id")).thenReturn("order_created");
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(3L, "PENDING", 1, List.of("1A"), "2500", "2500"))) {
            var response = service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John");

            assertThat(response.getOrderId()).isEqualTo("order_created");
            assertThat(response.getAmount()).isEqualByComparingTo("2500");
            verify(repo).save(any(Payment.class));
        }
    }

    @Test
    void createRazorpayOrderUsesTotalFareWhenTotalAmountMissing() throws Exception {
        RazorpayClient client = mock(RazorpayClient.class);
        OrderClient orderClient = mock(OrderClient.class);
        Order order = mock(Order.class);
        ReflectionTestUtils.setField(client, "orders", orderClient);

        when(repo.findTopByBookingIdOrderByTransactionDateDesc(2L)).thenReturn(Optional.empty());
        when(repo.findSuccessfulPaymentByBookingId(2L)).thenReturn(Optional.empty());
        when(razorpayProvider.getClient()).thenReturn(client);
        when(orderClient.create(any())).thenReturn(order);
        when(order.get("id")).thenReturn("order_fare");
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(3L, "PENDING", 1, List.of("1A"), "2500", null))) {
            var response = service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John");

            assertThat(response.getOrderId()).isEqualTo("order_fare");
            assertThat(response.getAmount()).isEqualByComparingTo("2500");
        }
    }

    @Test
    void createRazorpayOrderRejectsUserMismatch() {
        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(99L, "PENDING", 1, List.of("1A"), "2500", "2500"))) {
            assertThatThrownBy(() -> service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Booking does not belong to the current user");
        }
    }

    @Test
    void createRazorpayOrderRejectsSuccessfulExistingPayment() {
        when(repo.findSuccessfulPaymentByBookingId(2L)).thenReturn(Optional.of(samplePayment()));

        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(3L, "PENDING", 1, List.of("1A"), "2500", "2500"))) {
            assertThatThrownBy(() -> service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Payment has already been completed for this booking");
        }
    }

    @Test
    void createRazorpayOrderRejectsSeatCountMismatch() {
        try (MockedConstruction<RestTemplate> ignored = mockBookingLookup(bookingSnapshot(3L, "PENDING", 2, List.of("1A"), "2500", "2500"))) {
            assertThatThrownBy(() -> service.createRazorpayOrder(sampleOrderRequest(), "user@example.com", "John"))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Selected seats must match the passenger count");
        }
    }

    @Test
    void verifyAndProcessPaymentReturnsExistingSuccessfulPayment() {
        Payment payment = samplePayment();
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));

        PaymentVerificationRequest request = signedVerificationRequest("order_123", "pay_123", "secret");

        Payment result = service.verifyAndProcessPayment(request);

        assertThat(result).isSameAs(payment);
    }

    @Test
    void verifyAndProcessPaymentMarksPaymentSuccessful() {
        Payment payment = samplePayment();
        payment.setStatus(Payment.PaymentStatus.PENDING);
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentVerificationRequest request = signedVerificationRequest("order_123", "pay_new", "secret");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class)) {
            Payment result = service.verifyAndProcessPayment(request);

            assertThat(result.getStatus()).isEqualTo(Payment.PaymentStatus.SUCCESS);
            assertThat(result.getRazorpayPaymentId()).isEqualTo("pay_new");
            verify(mocked.constructed().get(0)).put("http://booking-service/bookings/2/status?status=CONFIRMED&paymentId=1", null);
        }
    }

    @Test
    void verifyPaymentSignatureMismatch() {
        PaymentVerificationRequest req = new PaymentVerificationRequest("order", "pay", "wrong");

        assertThatThrownBy(() -> service.verifyAndProcessPayment(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment verification failed");
    }

    @Test
    void verifyAndProcessPaymentThrowsWhenPaymentRecordMissing() {
        when(repo.findByRazorpayOrderId("missing_order")).thenReturn(Optional.empty());

        PaymentVerificationRequest request = signedVerificationRequest("missing_order", "pay_123", "secret");

        assertThatThrownBy(() -> service.verifyAndProcessPayment(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment record not found");
    }

    @Test
    void handleWebhookRejectsBlankPayload() {
        assertThatThrownBy(() -> service.handleWebhook(" ", "sig"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Webhook payload is required");
    }

    @Test
    void handleWebhookRejectsBlankSignature() {
        assertThatThrownBy(() -> service.handleWebhook("{}", " "))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Webhook signature is required");
    }

    @Test
    void handleWebhookRejectsInvalidSignature() {
        assertThatThrownBy(() -> service.handleWebhook("{}", "wrong"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid webhook signature");
    }

    @Test
    void handleWebhookReturnsNullWhenPaymentEntityMissing() {
        String body = "{\"event\":\"payment.captured\",\"payload\":{}}";

        Payment result = service.handleWebhook(body, computeHmacSHA256(body, "webhook-secret"));

        assertThat(result).isNull();
    }

    @Test
    void handleWebhookReturnsExistingSuccessfulPaymentWithoutSaving() {
        Payment payment = samplePayment();
        String body = """
                {
                  "event": "payment.captured",
                  "payload": {
                    "payment": {
                      "entity": {
                        "order_id": "order_123",
                        "id": "pay_123",
                        "status": "captured"
                      }
                    }
                  }
                }
                """;
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));

        Payment result = service.handleWebhook(body, computeHmacSHA256(body, "webhook-secret"));

        assertThat(result).isSameAs(payment);
    }

    @Test
    void handleWebhookMarksPaymentSuccessful() {
        Payment payment = samplePayment();
        payment.setStatus(Payment.PaymentStatus.PENDING);
        String body = """
                {
                  "event": "payment.authorized",
                  "payload": {
                    "payment": {
                      "entity": {
                        "order_id": "order_123",
                        "id": "pay_new",
                        "status": "authorized"
                      }
                    }
                  }
                }
                """;
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class)) {
            Payment result = service.handleWebhook(body, computeHmacSHA256(body, "webhook-secret"));

            assertThat(result.getStatus()).isEqualTo(Payment.PaymentStatus.SUCCESS);
            verify(mocked.constructed().get(0)).put("http://booking-service/bookings/2/status?status=CONFIRMED&paymentId=1", null);
        }
    }

    @Test
    void handleWebhookMarksPaymentFailed() {
        Payment payment = samplePayment();
        payment.setStatus(Payment.PaymentStatus.PENDING);
        String body = """
                {
                  "event": "payment.failed",
                  "payload": {
                    "payment": {
                      "entity": {
                        "order_id": "order_123",
                        "id": "pay_fail",
                        "status": "failed",
                        "error_description": "Card declined"
                      }
                    }
                  }
                }
                """;
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment result = service.handleWebhook(body, computeHmacSHA256(body, "webhook-secret"));

        assertThat(result.getStatus()).isEqualTo(Payment.PaymentStatus.FAILED);
        assertThat(result.getFailureReason()).isEqualTo("Card declined");
    }

    @Test
    void handleWebhookReturnsPaymentForUnhandledEvent() {
        Payment payment = samplePayment();
        payment.setStatus(Payment.PaymentStatus.PENDING);
        String body = """
                {
                  "event": "refund.processed",
                  "payload": {
                    "payment": {
                      "entity": {
                        "order_id": "order_123",
                        "id": "pay_123",
                        "status": "created"
                      }
                    }
                  }
                }
                """;
        when(repo.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));

        Payment result = service.handleWebhook(body, computeHmacSHA256(body, "webhook-secret"));

        assertThat(result).isSameAs(payment);
    }

    @Test
    void refundSuccess() throws Exception {
        Payment payment = samplePayment();
        RazorpayClient client = mock(RazorpayClient.class);
        PaymentClient paymentClient = mock(PaymentClient.class);
        ReflectionTestUtils.setField(client, "payments", paymentClient);

        when(repo.findById(1L)).thenReturn(Optional.of(payment));
        when(repo.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(razorpayProvider.getClient()).thenReturn(client);

        Payment result = service.refundPayment(1L, BigDecimal.TEN);

        assertThat(result.getStatus()).isEqualTo(Payment.PaymentStatus.REFUNDED);
        assertThat(result.getRefundAmount()).isEqualByComparingTo("10");
    }

    @Test
    void refundRejectsNonSuccess() {
        Payment payment = samplePayment();
        payment.setStatus(Payment.PaymentStatus.FAILED);

        when(repo.findById(1L)).thenReturn(Optional.of(payment));

        assertThatThrownBy(() -> service.refundPayment(1L, BigDecimal.TEN))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only successful payments can be refunded");
    }

    @Test
    void refundThrowsWhenGatewayRefundFails() throws Exception {
        Payment payment = samplePayment();
        RazorpayClient client = mock(RazorpayClient.class);
        PaymentClient paymentClient = mock(PaymentClient.class);
        ReflectionTestUtils.setField(client, "payments", paymentClient);

        when(repo.findById(1L)).thenReturn(Optional.of(payment));
        when(razorpayProvider.getClient()).thenReturn(client);
        when(paymentClient.refund(anyString(), any())).thenThrow(new RuntimeException("gateway down"));

        assertThatThrownBy(() -> service.refundPayment(1L, BigDecimal.TEN))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Refund failed");
    }

    @Test
    void getPaymentByIdSuccess() {
        when(repo.findById(1L)).thenReturn(Optional.of(samplePayment()));

        assertThat(service.getPaymentById(1L)).isNotNull();
    }

    @Test
    void getPaymentByIdThrows() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPaymentById(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getPaymentByTransactionIdSuccess() {
        when(repo.findByTransactionId("TXN")).thenReturn(Optional.of(samplePayment()));

        assertThat(service.getPaymentByTransactionId("TXN")).isNotNull();
    }

    @Test
    void getPaymentByTransactionIdThrows() {
        when(repo.findByTransactionId("TXN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPaymentByTransactionId("TXN"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void generatePdfSuccess() {
        when(repo.findById(1L)).thenReturn(Optional.of(samplePayment()));

        byte[] pdf = service.generatePaymentReceiptPdf(1L);

        assertThat(pdf).isNotEmpty();
    }

    @Test
    void generatePdfThrows() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.generatePaymentReceiptPdf(1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getPaymentsByBookingId() {
        when(repo.findByBookingId(1L)).thenReturn(List.of(samplePayment()));

        assertThat(service.getPaymentsByBookingId(1L)).hasSize(1);
    }

    @Test
    void getPaymentsByUserId() {
        when(repo.findByUserId(1L)).thenReturn(List.of(samplePayment()));

        assertThat(service.getPaymentsByUserId(1L)).hasSize(1);
    }

    @Test
    void getPaymentsByStatus() {
        when(repo.findByStatus(Payment.PaymentStatus.SUCCESS)).thenReturn(List.of(samplePayment()));

        assertThat(service.getPaymentsByStatus(Payment.PaymentStatus.SUCCESS)).hasSize(1);
    }

    @Test
    void notificationHelperSendsThreeNotifications() {
        NotificationHelper helper = new NotificationHelper();
        ReflectionTestUtils.setField(helper, "notificationBaseUrl", "http://notification-service");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class)) {
            helper.sendBookingConfirmation(3L, 4L, "user@example.com", "9876543210", "PNR123", "FL123");

            assertThat(mocked.constructed()).hasSize(3);
            mocked.constructed().forEach(template ->
                    verify(template).postForEntity(eq("http://notification-service/notifications"), any(), eq(Object.class)));
        }
    }

    @Test
    void notificationHelperSwallowsNotificationFailures() {
        NotificationHelper helper = new NotificationHelper();
        ReflectionTestUtils.setField(helper, "notificationBaseUrl", "http://notification-service");

        try (MockedConstruction<RestTemplate> mocked = mockConstruction(RestTemplate.class, (mock, context) ->
                when(mock.postForEntity(anyString(), any(), eq(Object.class))).thenThrow(new RuntimeException("down")))) {
            helper.sendBookingConfirmation(3L, 4L, "user@example.com", "9876543210", "PNR123", "FL123");

            assertThat(mocked.constructed()).hasSize(3);
        }
    }

    private MockedConstruction<RestTemplate> mockBookingLookup(Object bookingSnapshot) {
        return mockConstruction(RestTemplate.class, (mock, context) ->
                when(mock.getForObject(anyString(), any(Class.class), anyLong())).thenReturn(bookingSnapshot));
    }

    private Object bookingSnapshot(Long userId, String status, Integer passengers, List<String> seats, String totalFare, String totalAmount) {
        try {
            Class<?> clazz = Class.forName("com.skyBooker.payment.service.PaymentServiceImpl$BookingSnapshot");
            var constructor = clazz.getDeclaredConstructor();
            constructor.setAccessible(true);
            Object snapshot = constructor.newInstance();
            invokeSetter(clazz, snapshot, "setUserId", Long.class, userId);
            invokeSetter(clazz, snapshot, "setStatus", String.class, status);
            invokeSetter(clazz, snapshot, "setNumberOfPassengers", Integer.class, passengers);
            invokeSetter(clazz, snapshot, "setSelectedSeats", List.class, seats);
            invokeSetter(clazz, snapshot, "setTotalFare", BigDecimal.class, new BigDecimal(totalFare));
            invokeSetter(clazz, snapshot, "setTotalAmount", BigDecimal.class, totalAmount == null ? null : new BigDecimal(totalAmount));
            return snapshot;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void invokeSetter(Class<?> clazz, Object target, String method, Class<?> parameterType, Object value) throws Exception {
        Method setter = clazz.getDeclaredMethod(method, parameterType);
        setter.setAccessible(true);
        setter.invoke(target, value);
    }

    private RazorpayOrderRequest sampleOrderRequest() {
        return new RazorpayOrderRequest(2L, 3L, new BigDecimal("2500"), "INR", Payment.PaymentMethod.UPI);
    }

    private PaymentVerificationRequest signedVerificationRequest(String orderId, String paymentId, String secret) {
        return new PaymentVerificationRequest(orderId, paymentId, computeHmacSHA256(orderId + "|" + paymentId, secret));
    }

    private Payment samplePayment() {
        Payment p = new Payment();
        p.setId(1L);
        p.setTransactionId("TXN");
        p.setBookingId(2L);
        p.setUserId(3L);
        p.setAmount(new BigDecimal("2500"));
        p.setPaymentMethod(Payment.PaymentMethod.UPI);
        p.setStatus(Payment.PaymentStatus.SUCCESS);
        p.setGatewayTransactionId("gateway_123");
        p.setRazorpayOrderId("order_123");
        p.setRazorpayPaymentId("pay_123");
        p.setTransactionDate(LocalDateTime.now());
        return p;
    }

    private String computeHmacSHA256(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) {
                    hex.append('0');
                }
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
