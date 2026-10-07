export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          timezone: string;
          is_active: boolean;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["organizations"]["Row"],
          "id" | "created_at" | "updated_at" | "approved_at"
        > & {
          approved_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      professionals: {
        Row: {
          id: string;
          organization_id: string;
          branch_id: string | null;
          user_id: string | null;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["professionals"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["professionals"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          organization_id: string;
          branch_id: string | null;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["services"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      professional_services: {
        Row: {
          professional_id: string;
          service_id: string;
        };
        Insert: Database["public"]["Tables"]["professional_services"]["Row"];
        Update: Partial<Database["public"]["Tables"]["professional_services"]["Row"]>;
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          professional_id: string;
          organization_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["schedules"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["schedules"]["Insert"]>;
        Relationships: [];
      };
      schedule_blocks: {
        Row: {
          id: string;
          professional_id: string;
          organization_id: string;
          start_datetime: string;
          end_datetime: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["schedule_blocks"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["schedule_blocks"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          organization_id: string;
          branch_id: string | null;
          professional_id: string;
          service_id: string;
          customer_id: string | null;
          client_name: string;
          client_phone: string;
          client_email: string | null;
          start_datetime: string;
          end_datetime: string;
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["appointments"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          user_id: string;
          organization_id: string;
          role: "organization_admin" | "professional";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organization_members"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Row"]>;
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["branches"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          name: string;
          phone: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          user_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      platform_admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: Database["public"]["Tables"]["platform_admins"]["Row"];
        Update: Partial<Database["public"]["Tables"]["platform_admins"]["Row"]>;
        Relationships: [];
      };
      organization_invitations: {
        Row: {
          id: string;
          organization_id: string;
          professional_id: string | null;
          email: string;
          role: "organization_admin" | "professional";
          token: string;
          status: "pending" | "accepted" | "revoked" | "expired";
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["organization_invitations"]["Row"],
          "id" | "created_at" | "status" | "accepted_at"
        > & {
          status?: "pending" | "accepted" | "revoked" | "expired";
          accepted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organization_invitations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      public_list_professionals: {
        Args: { p_organization_id: string };
        Returns: Database["public"]["Tables"]["professionals"]["Row"][];
      };
      public_list_services: {
        Args: { p_organization_id: string };
        Returns: Database["public"]["Tables"]["services"]["Row"][];
      };
      public_list_professionals_for_service: {
        Args: { p_organization_id: string; p_service_id: string };
        Returns: Database["public"]["Tables"]["professionals"]["Row"][];
      };
      public_get_schedule: {
        Args: { p_professional_id: string; p_day_of_week: number };
        Returns: Database["public"]["Tables"]["schedules"]["Row"][];
      };
      public_list_schedule_blocks: {
        Args: { p_professional_id: string; p_range_start: string; p_range_end: string };
        Returns: Database["public"]["Tables"]["schedule_blocks"]["Row"][];
      };
      public_list_busy_slots: {
        Args: { p_professional_id: string; p_range_start: string; p_range_end: string };
        Returns: { start_datetime: string; end_datetime: string }[];
      };
      public_get_invitation_by_token: {
        Args: { p_token: string };
        Returns: {
          email: string;
          role: "organization_admin" | "professional";
          status: "pending" | "accepted" | "revoked" | "expired";
          organization_name: string;
          expires_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}
