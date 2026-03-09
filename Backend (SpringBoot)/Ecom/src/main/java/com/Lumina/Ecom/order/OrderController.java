package com.Lumina.Ecom.order;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderController(OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByCreatedAtDesc(uid));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable("orderId") String orderId) {
        return ResponseEntity.ok(orderItemRepository.findByOrderId(orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable("orderId") String orderId,
            @RequestParam("status") OrderStatus status
    ) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    order.setStatus(status);
                    orderRepository.save(order);
                    return ResponseEntity.ok(order);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

