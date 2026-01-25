import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0b32230e/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== Auth Routes ====================

// Sign up endpoint
app.post("/make-server-0b32230e/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user info in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email,
        name
      }
    });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: 'Internal server error during sign up' }, 500);
  }
});

// ==================== Initiative Routes ====================

// Get all initiatives
app.get("/make-server-0b32230e/initiatives", async (c) => {
  try {
    const initiatives = await kv.getByPrefix('initiative:');
    
    // Sort by creation date (newest first)
    const sortedInitiatives = initiatives.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ initiatives: sortedInitiatives });
  } catch (error) {
    console.log(`Error fetching initiatives: ${error}`);
    return c.json({ error: 'Failed to fetch initiatives' }, 500);
  }
});

// Get single initiative
app.get("/make-server-0b32230e/initiatives/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const initiative = await kv.get(`initiative:${id}`);

    if (!initiative) {
      return c.json({ error: 'Initiative not found' }, 404);
    }

    return c.json({ initiative });
  } catch (error) {
    console.log(`Error fetching initiative: ${error}`);
    return c.json({ error: 'Failed to fetch initiative' }, 500);
  }
});

// Create new initiative (requires auth)
app.post("/make-server-0b32230e/initiatives", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Auth error while creating initiative: ${authError?.message}`);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const body = await c.req.json();
    const { title, description, category, status, targetArea, beneficiaries, budget } = body;

    if (!title || !description || !category) {
      return c.json({ error: 'Title, description, and category are required' }, 400);
    }

    const initiativeId = crypto.randomUUID();
    const initiative = {
      id: initiativeId,
      title,
      description,
      category,
      status: status || 'active',
      targetArea: targetArea || '',
      beneficiaries: beneficiaries || 0,
      budget: budget || 0,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`initiative:${initiativeId}`, initiative);

    return c.json({ 
      message: 'Initiative created successfully',
      initiative 
    }, 201);
  } catch (error) {
    console.log(`Error creating initiative: ${error}`);
    return c.json({ error: 'Failed to create initiative' }, 500);
  }
});

// Update initiative (requires auth)
app.put("/make-server-0b32230e/initiatives/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Auth error while updating initiative: ${authError?.message}`);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const id = c.req.param('id');
    const existingInitiative = await kv.get(`initiative:${id}`);

    if (!existingInitiative) {
      return c.json({ error: 'Initiative not found' }, 404);
    }

    const body = await c.req.json();
    const updatedInitiative = {
      ...existingInitiative,
      ...body,
      id, // Preserve original ID
      createdBy: existingInitiative.createdBy, // Preserve creator
      createdAt: existingInitiative.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    await kv.set(`initiative:${id}`, updatedInitiative);

    return c.json({ 
      message: 'Initiative updated successfully',
      initiative: updatedInitiative 
    });
  } catch (error) {
    console.log(`Error updating initiative: ${error}`);
    return c.json({ error: 'Failed to update initiative' }, 500);
  }
});

// Delete initiative (requires auth)
app.delete("/make-server-0b32230e/initiatives/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      console.log(`Auth error while deleting initiative: ${authError?.message}`);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    const id = c.req.param('id');
    const existingInitiative = await kv.get(`initiative:${id}`);

    if (!existingInitiative) {
      return c.json({ error: 'Initiative not found' }, 404);
    }

    await kv.del(`initiative:${id}`);

    return c.json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    console.log(`Error deleting initiative: ${error}`);
    return c.json({ error: 'Failed to delete initiative' }, 500);
  }
});

// ==================== Statistics Routes ====================

// Get dashboard statistics
app.get("/make-server-0b32230e/statistics", async (c) => {
  try {
    const initiatives = await kv.getByPrefix('initiative:');
    
    const stats = {
      totalInitiatives: initiatives.length,
      activeInitiatives: initiatives.filter((i: any) => i.status === 'active').length,
      completedInitiatives: initiatives.filter((i: any) => i.status === 'completed').length,
      totalBeneficiaries: initiatives.reduce((sum: number, i: any) => sum + (i.beneficiaries || 0), 0),
      totalBudget: initiatives.reduce((sum: number, i: any) => sum + (i.budget || 0), 0),
      categories: {} as Record<string, number>
    };

    // Count by category
    initiatives.forEach((i: any) => {
      if (i.category) {
        stats.categories[i.category] = (stats.categories[i.category] || 0) + 1;
      }
    });

    return c.json({ stats });
  } catch (error) {
    console.log(`Error fetching statistics: ${error}`);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

Deno.serve(app.fetch);