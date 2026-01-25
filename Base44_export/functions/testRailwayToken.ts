import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const railwayToken = Deno.env.get('Railway_Token');
    const railwayProjectId = '185b3721-1d16-4d52-b862-30c0bc529581';

    if (!railwayToken) {
      return Response.json({ error: 'Railway_Token not set' }, { status: 400 });
    }

    const logs = [];

    // Test 1: Try to list all projects (simpler query to verify token works)
    logs.push('🔍 Test 1: Listing all projects...');

    const listProjectsRes = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query {
            projects {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        `
      })
    });

    const listText = await listProjectsRes.text();
    logs.push(`List response status: ${listProjectsRes.status}`);

    let listData;
    try {
      listData = JSON.parse(listText);
    } catch (e) {
      logs.push(`Failed to parse: ${listText.slice(0, 200)}`);
      return Response.json({
        success: false,
        error: 'Failed to parse Railway response',
        logs: logs.join('\n')
      });
    }

    if (listData.errors) {
      logs.push(`❌ Token cannot list projects: ${JSON.stringify(listData.errors)}`);
      return Response.json({
        success: false,
        error: 'Token invalid or no permissions',
        errors: listData.errors,
        logs: logs.join('\n')
      });
    }

    const projects = listData.data?.projects?.edges?.map(e => ({ id: e.node.id, name: e.node.name })) || [];
    logs.push(`✓ Token works! Found ${projects.length} projects`);
    logs.push(`Projects: ${JSON.stringify(projects, null, 2)}`);

    // Test 2: Try to access the specific project
    logs.push(`\n🔍 Test 2: Querying project ${railwayProjectId}...`);

    const projectQueryRes = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query {
            project(id: "${railwayProjectId}") {
              id
              name
              services {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        `
      })
    });

    const projectText = await projectQueryRes.text();
    logs.push(`Project query status: ${projectQueryRes.status}`);

    let projectData;
    try {
      projectData = JSON.parse(projectText);
    } catch (e) {
      logs.push(`Parse error: ${projectText.slice(0, 200)}`);
    }

    if (projectData?.errors) {
      logs.push(`❌ Cannot access project: ${JSON.stringify(projectData.errors)}`);

      // Check if project ID is in the list
      const foundProject = projects.find(p => p.id === railwayProjectId);
      if (foundProject) {
        logs.push(`✓ Project IS in your list but token can't access it (wrong scope?)`);
      } else {
        logs.push(`❌ Project NOT in your list. Available projects:`);
        projects.forEach(p => logs.push(`  - ${p.name} (${p.id})`));
      }
    } else if (projectData?.data?.project) {
      logs.push(`✓ Successfully accessed project: ${projectData.data.project.name}`);
    }

    return Response.json({
      success: !projectData?.errors,
      token_works: true,
      available_projects: projects,
      target_project: projectData?.data?.project || null,
      errors: projectData?.errors || null,
      logs: logs.join('\n')
    });

  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});