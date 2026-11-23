-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_customization_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = $1 AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_restaurant_member(user_id UUID, res_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_members
    WHERE user_id = $1 AND restaurant_id = $2 AND membership_status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3. RESTAURANTS POLICIES
CREATE POLICY "Anyone can view approved active restaurants"
  ON public.restaurants FOR SELECT
  USING (is_approved = true AND is_active = true OR public.is_restaurant_member(auth.uid(), id) OR public.is_admin(auth.uid()));

CREATE POLICY "Restaurant members can update their restaurant"
  ON public.restaurants FOR UPDATE
  USING (public.is_restaurant_member(auth.uid(), id) OR public.is_admin(auth.uid()));

-- 4. RESTAURANT MEMBERS POLICIES
CREATE POLICY "Members can view their membership"
  ON public.restaurant_members FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- 5. MENU CATEGORIES & ITEMS POLICIES
CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Restaurant members can manage categories"
  ON public.menu_categories FOR ALL
  USING (public.is_restaurant_member(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Restaurant members can manage menu items"
  ON public.menu_items FOR ALL
  USING (public.is_restaurant_member(auth.uid(), restaurant_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view customization groups"
  ON public.item_customization_groups FOR SELECT USING (true);

CREATE POLICY "Anyone can view customization options"
  ON public.item_customization_options FOR SELECT USING (true);

-- 6. ADDRESSES POLICIES
CREATE POLICY "Customers can manage their own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = customer_id);

-- 7. CARTS & CART ITEMS POLICIES
CREATE POLICY "Customers can manage their own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can manage their cart items"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id AND carts.customer_id = auth.uid()
    )
  );

-- 8. ORDERS POLICIES
CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_restaurant_member(auth.uid(), restaurant_id)
    OR EXISTS (
      SELECT 1 FROM public.delivery_assignments
      WHERE delivery_assignments.order_id = orders.id AND delivery_assignments.delivery_partner_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Customers can create orders for themselves"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Authorized users can update order status"
  ON public.orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR public.is_restaurant_member(auth.uid(), restaurant_id)
    OR EXISTS (
      SELECT 1 FROM public.delivery_assignments
      WHERE delivery_assignments.order_id = orders.id AND delivery_assignments.delivery_partner_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

-- 9. ORDER ITEMS POLICIES
CREATE POLICY "Order items readable by order participants"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND (
        orders.customer_id = auth.uid()
        OR public.is_restaurant_member(auth.uid(), orders.restaurant_id)
        OR EXISTS (
          SELECT 1 FROM public.delivery_assignments
          WHERE delivery_assignments.order_id = orders.id AND delivery_assignments.delivery_partner_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
      )
    )
  );

CREATE POLICY "Order items inserted on order creation"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

-- 10. PAYMENTS POLICIES
CREATE POLICY "Payments readable by order customer or restaurant or admin"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id AND (
        orders.customer_id = auth.uid()
        OR public.is_restaurant_member(auth.uid(), orders.restaurant_id)
        OR public.is_admin(auth.uid())
      )
    )
  );

-- 11. COUPONS POLICIES
CREATE POLICY "Authenticated users can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- 12. COUPON REDEMPTIONS POLICIES
CREATE POLICY "Customers can view their redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

-- 13. ORDER STATUS HISTORY POLICIES
CREATE POLICY "Order history viewable by order participants"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id AND (
        orders.customer_id = auth.uid()
        OR public.is_restaurant_member(auth.uid(), orders.restaurant_id)
        OR EXISTS (
          SELECT 1 FROM public.delivery_assignments
          WHERE delivery_assignments.order_id = orders.id AND delivery_assignments.delivery_partner_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
      )
    )
  );

-- 14. DELIVERY ASSIGNMENTS POLICIES
CREATE POLICY "Delivery partners can view assignments offered/accepted"
  ON public.delivery_assignments FOR SELECT
  USING (
    delivery_partner_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = delivery_assignments.order_id AND public.is_restaurant_member(auth.uid(), orders.restaurant_id)
    )
  );

CREATE POLICY "Delivery partners can update their assignment"
  ON public.delivery_assignments FOR UPDATE
  USING (delivery_partner_id = auth.uid() OR public.is_admin(auth.uid()));

-- 15. DELIVERY LOCATIONS POLICIES
CREATE POLICY "Delivery partners can insert location"
  ON public.delivery_locations FOR INSERT
  WITH CHECK (delivery_partner_id = auth.uid());

CREATE POLICY "Order participants can view delivery location"
  ON public.delivery_locations FOR SELECT
  USING (
    delivery_partner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = delivery_locations.order_id AND (
        orders.customer_id = auth.uid()
        OR public.is_restaurant_member(auth.uid(), orders.restaurant_id)
        OR public.is_admin(auth.uid())
      )
    )
  );

-- 16. NOTIFICATIONS POLICIES
CREATE POLICY "Users can manage their notifications"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- 17. REVIEWS POLICIES
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Customers can insert review for their delivered order"
  ON public.reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id AND orders.customer_id = auth.uid() AND orders.order_status = 'delivered'
    )
  );
