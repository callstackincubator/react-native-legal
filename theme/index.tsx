import {
  Announcement,
  Button,
  HomeBanner,
  HomeFeature,
  HomeFooter,
  HomeHero,
  LinkCard,
  OutlineCTA,
  PrevNextPage,
  VersionBadge,
} from '@callstack/rspress-theme';
import { Link, HomeLayout, Layout as RspressLayout } from 'rspress/theme';

const Layout = () => (
  <RspressLayout
    // beforeNav={<Announcement href="./guide" message="Announcement Test" localStorageKey="" />}
    afterOutline={<OutlineCTA href="https://callstack.com" />}
  />
);

// const HomeLayout = () => {
//   return (
//     <RspressHomeLayout
//       afterFeatures={
//         <>
//           <div className="docs-introduction-cta">
//             <Link href="/docs/introduction">
//               <Button theme="alt" type="button">
//                 Not sure, which to choose?
//               </Button>
//             </Link>
//           </div>

//           <HomeBanner href="https://callstack.com" />
//           <HomeFooter />
//         </>
//       }
//     />
//   );
// };

// custom layouts and any components to be available via '@theme'
// export { Layout, HomeLayout, PrevNextPage, HomeFeature, HomeHero, LinkCard, Button, VersionBadge, Announcement };
// re-export the default theme components which are not overridden
export * from 'rspress/theme';
